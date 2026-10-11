package helpers

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ErrSupersededDelete is returned when a write targets a record that was
// tombstoned by a newer delete.
var ErrSupersededDelete = errors.New("record was deleted by a newer change")

// Models that participate in offline sync.
type Syncable interface {
	GetClientId() string
	GetLastUpdated() string
}

const databaseName = "habits"

// NotDeletedFilter matches every document that has not been tombstoned.
func NotDeletedFilter() bson.M {
	return bson.M{"deleted": bson.M{"$ne": true}}
}

// ParseTimestamp parses an RFC3339/ISO-8601 timestamp. Missing or invalid
// timestamps are treated as the zero time (oldest possible change).
func ParseTimestamp(value string) time.Time {
	if value == "" {
		return time.Time{}
	}

	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		// tolerate values without timezone information
		parsed, err = time.Parse("2006-01-02T15:04:05", value)
		if err != nil {
			return time.Time{}
		}
	}

	return parsed
}

// NowTimestamp returns the current time as an ISO-8601 string.
func NowTimestamp() string {
	return time.Now().UTC().Format(time.RFC3339Nano)
}

// IsNewer reports whether the incoming timestamp is strictly after the
// existing one.
func IsNewer(incoming, existing string) bool {
	return ParseTimestamp(incoming).After(ParseTimestamp(existing))
}

func collection(db models.Database, table string) *mongo.Collection {
	return db.Client.Database(databaseName).Collection(table)
}

func getString(doc bson.M, key string) string {
	if value, ok := doc[key].(string); ok {
		return value
	}

	return ""
}

func getBool(doc bson.M, key string) bool {
	if value, ok := doc[key].(bool); ok {
		return value
	}

	return false
}

func toBsonM(value interface{}) (bson.M, error) {
	raw, err := bson.Marshal(value)
	if err != nil {
		return nil, err
	}

	var doc bson.M
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return nil, err
	}

	return doc, nil
}

// decodeDoc converts a raw document into a typed model. The mongo "_id" is
// copied into the model's "Id" field (as its hex representation) so clients
// always receive an id, matching the previous behaviour.
func decodeDoc[T any](doc bson.M) (T, error) {
	var model T

	if objectID, ok := doc["_id"].(primitive.ObjectID); ok {
		doc["id"] = objectID.Hex()
	}

	raw, err := bson.Marshal(doc)
	if err != nil {
		return model, err
	}

	err = bson.Unmarshal(raw, &model)

	return model, err
}

// FindRawByClientId returns the raw document with the given client id, or
// nil when it does not exist.
func FindRawByClientId(db models.Database, table, clientId string) (bson.M, error) {
	var doc bson.M

	err := collection(db, table).
		FindOne(db.Ctx, bson.M{"clientid": clientId}).
		Decode(&doc)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return doc, nil
}

// FetchSynced returns the model with the given client id, excluding
// tombstoned (deleted) records.
func FetchSynced[T any](db models.Database, table, clientId string) (*T, bool, error) {
	var doc bson.M

	err := collection(db, table).
		FindOne(db.Ctx, bson.M{"clientid": clientId, "deleted": bson.M{"$ne": true}}).
		Decode(&doc)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, false, nil
	}

	if err != nil {
		return nil, false, err
	}

	model, err := decodeDoc[T](doc)
	if err != nil {
		return nil, false, err
	}

	return &model, true, nil
}

// UpsertSynced creates or updates a record using last-write-wins conflict
// resolution based on the LastUpdated timestamps.
//
// Because every client generates globally unique client ids and replays its
// offline operations, the same operation may arrive more than once, and
// operations from different clients may conflict:
//
//   - unknown client id  -> the record is created
//   - incoming is newer  -> the incoming document replaces the stored one
//   - incoming is older  -> the stored document is kept (conflict resolved)
//
// The returned model always reflects the state stored on the server, so the
// client can converge by pulling.
func UpsertSynced[T Syncable](db models.Database, table string, incoming T) (T, error) {
	doc, err := toBsonM(incoming)
	if err != nil {
		var zero T
		return zero, err
	}

	clientId := incoming.GetClientId()
	if clientId == "" {
		clientId = NextClientId(db, table)
		doc["clientid"] = clientId
	}

	if getString(doc, "lastupdated") == "" {
		doc["lastupdated"] = NowTimestamp()
	}

	existing, err := FindRawByClientId(db, table, clientId)
	if err != nil {
		var zero T
		return zero, err
	}

	coll := collection(db, table)

	if existing == nil {
		doc["deleted"] = false

		result, err := coll.InsertOne(db.Ctx, doc)
		if err != nil {
			var zero T
			return zero, err
		}

		if objectID, ok := result.InsertedID.(primitive.ObjectID); ok {
			doc["id"] = objectID.Hex()
		}

		return decodeDoc[T](doc)
	}

	incomingUpdated := ParseTimestamp(getString(doc, "lastupdated"))
	existingUpdated := ParseTimestamp(getString(existing, "lastupdated"))

	if existingUpdated.After(incomingUpdated) || existingUpdated.Equal(incomingUpdated) {
		// conflict: the server already has an equal or newer version, the
		// incoming change loses. If the stored record was deleted after the
		// incoming change was made, the change stays rejected.
		if getBool(existing, "deleted") {
			var zero T
			return zero, ErrSupersededDelete
		}

		if objectID, ok := existing["_id"].(primitive.ObjectID); ok {
			existing["id"] = objectID.Hex()
		}

		return decodeDoc[T](existing)
	}

	// the incoming change wins: replace the stored document (the mongo _id
	// is preserved because the replacement does not contain one)
	delete(doc, "_id")

	_, err = coll.ReplaceOne(db.Ctx, bson.M{"clientid": clientId}, doc)
	if err != nil {
		var zero T
		return zero, err
	}

	if objectID, ok := existing["_id"].(primitive.ObjectID); ok {
		doc["id"] = objectID.Hex()
	}

	return decodeDoc[T](doc)
}

// DeleteSynced tombstones a record instead of hard-deleting it, so other
// clients converge on the deletion when they pull. The delete loses if the
// record was modified after the delete was made.
//
// Returns true when the record was deleted (or never existed).
func DeleteSynced(db models.Database, table, clientId, deleteTimestamp string) (bool, error) {
	existing, err := FindRawByClientId(db, table, clientId)
	if err != nil {
		return false, err
	}

	if existing == nil {
		// nothing to delete; idempotent so replays never fail
		return true, nil
	}

	existingUpdated := ParseTimestamp(getString(existing, "lastupdated"))
	deleteTime := ParseTimestamp(deleteTimestamp)

	if deleteTime.IsZero() {
		deleteTime = time.Now()
	}

	if existingUpdated.After(deleteTime) {
		// conflict: the record was modified after this delete was made, so
		// the delete loses and the record is kept
		return false, nil
	}

	now := NowTimestamp()

	_, err = collection(db, table).UpdateOne(
		db.Ctx,
		bson.M{"clientid": clientId},
		bson.M{"$set": bson.M{
			"deleted":     true,
			"deletedat":   now,
			"lastupdated": now,
		}},
	)

	return true, err
}

// ListSynced returns every non-deleted model in a table.
func ListSynced[T any](db models.Database, table string) ([]T, error) {
	cursor, err := collection(db, table).
		Find(db.Ctx, NotDeletedFilter())
	if err != nil {
		return nil, err
	}

	defer cursor.Close(db.Ctx)

	response := []T{}

	for cursor.Next(db.Ctx) {
		var raw bson.M
		if err := cursor.Decode(&raw); err != nil {
			return nil, err
		}

		model, err := decodeDoc[T](raw)
		if err != nil {
			return nil, err
		}

		response = append(response, model)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return response, nil
}

// NextClientId allocates a new numeric client id for clients that connect
// directly to the API without generating one themselves.
//
// The counter is kept in its own collection and incremented atomically so
// two concurrent requests can never be handed the same id (the previous
// implementation scanned the whole collection and raced).
func NextClientId(db models.Database, table string) string {
	counters := db.Client.Database(databaseName).Collection("counters")

	var counter struct {
		Value int64 `bson:"value"`
	}

	err := counters.FindOne(db.Ctx, bson.M{"_id": table}).Decode(&counter)
	if errors.Is(err, mongo.ErrNoDocuments) {
		// initialise the counter above any client id that already exists so
		// ids allocated before the counter existed are never reused
		largest := largestNumericClientId(db, table)
		_, _ = counters.UpdateOne(
			db.Ctx,
			bson.M{"_id": table},
			bson.M{"$set": bson.M{"value": largest}},
			options.Update().SetUpsert(true),
		)
	}

	var result struct {
		Value int64 `bson:"value"`
	}

	err = counters.FindOneAndUpdate(
		db.Ctx,
		bson.M{"_id": table},
		bson.M{"$inc": bson.M{"value": 1}},
		options.FindOneAndUpdate().
			SetUpsert(true).
			SetReturnDocument(options.After),
	).Decode(&result)

	if err != nil {
		logFallback(err)
		// fall back to a unique-enough value rather than failing the request
		return strconv.FormatInt(time.Now().UnixNano(), 10)
	}

	return strconv.FormatInt(result.Value+1, 10)
}

func largestNumericClientId(db models.Database, table string) int64 {
	var largestId int64 = 0

	cursor, err := collection(db, table).Find(db.Ctx, bson.D{})
	if err != nil {
		return 0
	}

	defer cursor.Close(db.Ctx)

	for cursor.Next(db.Ctx) {
		var result bson.M
		if err := cursor.Decode(&result); err != nil {
			fmt.Println(err)
			continue
		}

		id, err := strconv.ParseInt(getString(result, "clientid"), 10, 64)
		if err != nil {
			continue
		}

		if id > largestId {
			largestId = id
		}
	}

	return largestId
}

func logFallback(err error) {
	fmt.Println("NextClientId fallback:", err)
}
