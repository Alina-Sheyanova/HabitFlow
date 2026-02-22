package com.habitflow;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class HabitApiTest {

    private static final String BASE_URL = "http://localhost:8000";
    private static final String HABITS_ENDPOINT = "/habits";
    private static String habitId;

    @BeforeAll
    public static void setup() {
        RestAssured.baseURI = BASE_URL;
    }

    /**
     GET /habits/ - Получить список привычек
     */
    @Test
    public void testGetAllHabits() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .get(HABITS_ENDPOINT)
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("", hasSize(greaterThanOrEqualTo(0)))
                .log().all();
    }

    /**
     POST /habits/ - Создать новую привычку
     */
    @Test
    public void testCreateHabit() {
        String requestBody = """
                {
                    "name": "Медитация",
                    "description": "Медитировать 10 минут",
                    "goalDays": 30
                }
                """;

        habitId = given()
                .contentType(ContentType.JSON)
                .body(requestBody)
        .when()
                .post(HABITS_ENDPOINT)
        .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("name", equalTo("Медитация"))
                .body("description", equalTo("Медитировать 10 минут"))
                .body("goalDays", equalTo(30))
                .body("id", notNullValue())
                .body("createdAt", notNullValue())
                .body("completedDates", hasSize(0))
                .log().all()
                .extract()
                .path("id");

        System.out.println("Созданная привычка ID: " + habitId);
    }

    /**
     POST /habits/{habit_id}/toggle - Отметить привычку как выполненную
     */
    @Test
    public void testToggleHabitCompletion() {
        // Сначала создаём привычку
        String createBody = """
                {
                    "name": "Спорт",
                    "description": "Зарядка 20 минут",
                    "goalDays": null
                }
                """;

        String id = given()
                .contentType(ContentType.JSON)
                .body(createBody)
        .when()
                .post(HABITS_ENDPOINT)
        .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Теперь переключаем на сегодня
        String toggleBody = """
                {
                    "date": "%s"
                }
                """.formatted(LocalDate.now());

        given()
                .contentType(ContentType.JSON)
                .body(toggleBody)
        .when()
                .post(HABITS_ENDPOINT + "/" + id + "/toggle")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(id))
                .body("name", equalTo("Спорт"))
                .body("completedDates", hasSize(1))
                .body("completedDates[0]", equalTo(LocalDate.now().toString()))
                .log().all();
    }

    /**
     DELETE /habits/{habit_id} - Удалить привычку
     */
    @Test
    public void testDeleteHabit() {
        // Сначала создаём привычку
        String createBody = """
                {
                    "name": "Чтение",
                    "description": "Читать книгу",
                    "goalDays": null
                }
                """;

        String id = given()
                .contentType(ContentType.JSON)
                .body(createBody)
        .when()
                .post(HABITS_ENDPOINT)
        .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Удаляем привычку
        given()
                .contentType(ContentType.JSON)
        .when()
                .delete(HABITS_ENDPOINT + "/" + id)
        .then()
                .statusCode(204)
                .log().all();

        // Проверяем что удалена
        given()
                .contentType(ContentType.JSON)
        .when()
                .get(HABITS_ENDPOINT + "/" + id)
        .then()
                .statusCode(404)
                .log().all();
    }

    /**
     GET /habits/activity - Получить статистику активности
     */
    @Test
    public void testGetActivity() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .get(HABITS_ENDPOINT + "/activity")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("activity", notNullValue())
                .log().all();
    }

    /**
      Создать привычку с пустым названием
     */
    @Test
    public void testCreateHabitWithBlankName() {
        String requestBody = """
                {
                    "name": "   ",
                    "description": "Пустое имя",
                    "goalDays": null
                }
                """;

        given()
                .contentType(ContentType.JSON)
                .body(requestBody)
        .when()
                .post(HABITS_ENDPOINT)
        .then()
                .statusCode(422)
                .log().all();
    }

    /**
      Переключить несуществующую привычку
     */
    @Test
    public void testToggleNonExistentHabit() {
        String toggleBody = """
                {
                    "date": "%s"
                }
                """.formatted(LocalDate.now());

        given()
                .contentType(ContentType.JSON)
                .body(toggleBody)
        .when()
                .post(HABITS_ENDPOINT + "/non-existent-id/toggle")
        .then()
                .statusCode(404)
                .log().all();
    }

    /**
     Удалить несуществующую привычку
     */
    @Test
    public void testDeleteNonExistentHabit() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .delete(HABITS_ENDPOINT + "/non-existent-id")
        .then()
                .statusCode(404)
                .log().all();
    }
}
