package routes

import (
	"log"

	"server/helpers"
	"server/models"

	"github.com/gin-gonic/gin"
)

// POST /tasks
//
// Upsert keyed by client id with last-write-wins conflict resolution, so
// offline replays and concurrent clients converge (see goals.go).
func CreateTask(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Task

		if err := context.BindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		task, err := helpers.UpsertSynced(database, "tasks", requestBody)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, task)
	}
}

// GET /tasks
func ListTasks(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		tasks, err := helpers.ListSynced[models.Task](database, "tasks")
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, tasks)
	}
}

// GET /tasks/:id
func GetTask(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")

		task, found, err := helpers.FetchSynced[models.Task](database, "tasks", id)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		if !found {
			helpers.NotFoundError(context)
			return
		}

		helpers.Success(context, task)
	}
}

// PUT /tasks/:id
func UpdateTask(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		var requestBody models.Task

		if err := context.ShouldBindJSON(&requestBody); err != nil {
			log.Println(err)
			helpers.BadRequestError(context)
			return
		}

		if pathId := context.Param("id"); pathId != "" {
			requestBody.ClientId = pathId
		}

		task, err := helpers.UpsertSynced(database, "tasks", requestBody)
		if err == helpers.ErrSupersededDelete {
			helpers.NotFoundError(context)
			return
		}
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, task)
	}
}

// DELETE /tasks/:id
//
// NOTE: the previous implementation filtered on _id with the client id,
// which could never match and made task deletion a silent no-op.
func DeleteTask(database models.Database) func(context *gin.Context) {
	return func(context *gin.Context) {
		id := context.Param("id")
		lastUpdated := context.Query("lastUpdated")

		_, err := helpers.DeleteSynced(database, "tasks", id, lastUpdated)
		if err != nil {
			log.Println(err)
			helpers.InternalServerError(context)
			return
		}

		helpers.Success(context, nil)
	}
}
