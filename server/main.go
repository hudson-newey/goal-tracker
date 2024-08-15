package main

import (
	"log"
	"server/cors"
	"server/databaseService"
	"server/helpers"
	"server/models"
	"server/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// configure CORS
	router.Use(cors.Default())

	// create database connection
	dbClient, ctx, _, err := databaseService.Connect("mongodb://gt-database:27017")

	if err != nil {
		panic(err)
	}

	var database models.Database
	database.Client = dbClient
	database.Ctx = ctx

	// TODO: probably move this to a separate file such as routes/routes.go
	// goals
	router.POST("/goals", routes.CreateGoal(database))
	router.GET("/goals", routes.ListGoals(database))
	router.GET("/goals/:id", routes.GetGoal(database))
	router.PUT("/goals/:id", routes.UpdateGoal(database))
	router.DELETE("/goals/:id", routes.DeleteGoal(database))

	router.GET("/goals/search", routes.SearchGoals(database))
	router.GET("/goals/:id/tasks", routes.ListTasksByGoal(database))
	router.GET("/goals/:id/habits", routes.ListHabitsByGoal(database))

	// habits
	router.POST("/habits", routes.CreateHabit(database))
	router.GET("/habits", routes.ListHabits(database))
	router.GET("/habits/:id", routes.GetHabit(database))
	router.PUT("/habits/:id", routes.UpdateHabit(database))
	router.DELETE("/habits/:id", routes.DeleteHabit(database))

	// tasks
	router.POST("/tasks", routes.CreateTask(database))
	router.GET("/tasks", routes.ListTasks(database))
	router.GET("/tasks/:id", routes.GetTask(database))
	router.PUT("/tasks/:id", routes.UpdateTask(database))
	router.DELETE("/tasks/:id", routes.DeleteTask(database))

	// logbook
	router.POST("/logbooks", routes.CreateLogbook(database))
	router.GET("/logbooks", routes.ListLogbooks(database))
	router.GET("/logbooks/:id", routes.GetLogbook(database))
	router.PUT("/logbooks/:id", routes.UpdateLogbook(database))
	router.DELETE("/logbooks/:id", routes.DeleteLogbook(database))

	// AI routes
	// these routes are used so that when you create a goal, the app can provide suggestions on what
	// tasks and habits you can do to achieve that goal
	router.POST("/ai/habits", routes.ListHabitsForGoal)
	router.POST("/ai/tasks", routes.ListTasksForGoal)

	// generic app routes
	router.GET("/", routes.RedirectRoute)

	// ping routes
	router.GET("/ping", routes.PingRoute)

	serverPort := ":" + helpers.EnvVariable("PORT")

	log.Println("Server running on port",  serverPort)
	if err := router.Run(serverPort); err != nil {
		panic(err)
	}
}
