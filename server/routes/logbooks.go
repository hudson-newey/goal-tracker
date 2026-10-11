package routes

import (
	"log"

	"server/helpers"
	"server/models"

	"github.com/gin-gonic/gin"
)

// POST /logbooks
//
// Upsert keyed by client id with last-write-wins conflict resolution, so
// offline replays and concurrent clients converge (see goals.go).
func CreateLogbook(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Logbook

		if err := context.BindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		logbook, err := helpers.UpsertSynced(database, "logbooks", requestBody)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, logbook)
	}
}

// GET /logbooks
func ListLogbooks(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		logbooks, err := helpers.ListSynced[models.Logbook](database, "logbooks")
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, logbooks)
	}
}

// GET /logbooks/:id
func GetLogbook(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		logbook, found, err := helpers.FetchSynced[models.Logbook](database, "logbooks", id)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		if !found {
			helpers.NotFoundError(context)
			return
		}

		helpers.Success(context, logbook)
	}
}

// PUT /logbooks/:id
func UpdateLogbook(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Logbook

		if err := context.ShouldBindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		if pathId := context.Param("id"); pathId != "" {
			requestBody.ClientId = pathId
		}

		logbook, err := helpers.UpsertSynced(database, "logbooks", requestBody)
		if err == helpers.ErrSupersededDelete {
			helpers.NotFoundError(context)
			return
		}
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, logbook)
	}
}

// DELETE /logbooks/:id
func DeleteLogbook(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")
		lastUpdated := context.Query("lastUpdated")

		_, err := helpers.DeleteSynced(database, "logbooks", id, lastUpdated)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, nil)
	}
}
