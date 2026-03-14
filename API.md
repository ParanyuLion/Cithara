# Cithara API Documentation

## Overview

The Cithara API provides endpoints for managing songs. All endpoints return JSON responses and support standard HTTP methods for CRUD operations.

## Base URL

```
http://127.0.0.1:8000/songs/
```

## Authentication

Currently, the API does not require authentication for most endpoints. A default user must exist in the system for creating songs.

## Data Models

### Song

Represents a song in the system.

```json
{
  "id": 1,
  "title": "Song Title",
  "genre": "Pop",
  "mood": "Happy",
  "ocasion": "Party",
  "prompt": "A fun party song",
  "singer_voice": "Male",
  "audio_file": "/media/songs/filename.mp3",
  "shareable_link": "https://example.com/song/xyz",
  "created_at": "2024-03-14T10:30:00Z",
  "status": "Completed",
  "creator_id": 1
}
```

#### Fields

- `id`: Integer - Unique identifier for the song
- `title`: String - Song title
- `genre`: String - Genre of the song (Pop, Rock, Jazz, Hip-Hop, Country)
- `mood`: String - Mood of the song
- `ocasion`: String - Occasion for the song
- `prompt`: String (max 1000 chars) - Prompt used to generate the song
- `singer_voice`: String - Singer voice type
- `audio_file`: File - Path to the audio file
- `shareable_link`: URL - Shareable link to the song
- `created_at`: DateTime - When the song was created
- `status`: String - Status of the song (Pending, Generating, Completed, Failed)
- `creator_id`: Integer - id of song creator

## Endpoints

### 1. Get All Songs

**Request:**

```
GET /songs/
```

**Description:**
Retrieves a list of all non-deleted songs.

**Query Parameters:**
None

**Response:**

```json
[
  {
    "id": 1,
    "title": "My Song",
    "genre": "Pop",
    "mood": "Happy",
    "ocasion": "Party",
    "prompt": "A fun song",
    "singer_voice": "Male",
    "audio_file": "/media/songs/demo.mp3",
    "shareable_link": null,
    "created_at": "2024-03-14T10:30:00Z",
    "status": "Completed",
    "creator_id": 1,
    "deleted_at": null
  }
]
```

**Status Codes:**

- `200 OK` - Successfully retrieved songs
- `500 Internal Server Error` - Server error

**Screenshot:**

![Get Songs](API_screenshot/get%20songs.png)

---

### 2. Create Song

**Request:**

```
POST /songs/create/
```

**Description:**
Creates a new song. Requires JSON body with song details.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "New Song",
  "genre": "Pop",
  "mood": "Happy",
  "ocasion": "Party",
  "prompt": "Create a happy party song",
  "singer_voice": "Female"
}
```

**Response:**

```json
{
  "message": "Created",
  "id": 5,
  "title": "New Song"
}
```

**Status Codes:**

- `201 Created` - Song successfully created
- `400 Bad Request` - Invalid JSON or missing required fields
- `500 Internal Server Error` - Server error

**Required Fields:**

- `title`
- `genre`
- `mood`
- `ocasion`
- `singer_voice`

**Optional Fields:**

- `prompt`

**Screenshot:**

![Create Song](API_screenshot/create%20song.png)

---

### 3. Get Song Details

**Request:**

```
GET /songs/<song_id>/
```

**Description:**
Retrieves detailed information about a specific song.

**Path Parameters:**

- `song_id`: Integer - The ID of the song

**Response:**

```json
{
  "id": 1,
  "title": "My Song",
  "genre": "Pop",
  "mood": "Happy",
  "ocasion": "Party",
  "prompt": "A fun song",
  "singer_voice": "Male",
  "audio_file": "/media/songs/demo.mp3",
  "shareable_link": null,
  "created_at": "2024-03-14T10:30:00Z",
  "status": "Completed"
}
```

**Status Codes:**

- `200 OK` - Song found and returned
- `404 Not Found` - Song with given ID not found
- `500 Internal Server Error` - Server error

**Screenshot:**

![Get Song Detail](API_screenshot/get%20song%20detail.png)

---

### 4. Update Song

**Request:**

```
PATCH /songs/<song_id>/update/
```

**Description:**
Updates an existing song with partial or full song data.

**Path Parameters:**

- `song_id`: Integer - The ID of the song

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "Generating"
}
```

**Response:**

```json
{
  "message": "Updated",
  "id": 1,
  "title": "My Song"
}
```

**Status Codes:**

- `200 OK` - Song successfully updated
- `400 Bad Request` - Invalid data
- `404 Not Found` - Song not found
- `500 Internal Server Error` - Server error

**Updatable Fields:**

- `status`

**Screenshot:**

![Update Song Status](API_screenshot/update%20song%20status.png)

---

### 5. Delete Song

**Request:**

```
DELETE /songs/<song_id>/delete/
```

**Description:**
Soft deletes a song (marks as deleted without removing from database).

**Path Parameters:**

- `song_id`: Integer - The ID of the song

**Response:**

```json
{
  "message": "Deleted (Soft Delete)"
}
```

**Status Codes:**

- `200 OK` - Song successfully deleted
- `400 Bad Request` - Song already deleted
- `404 Not Found` - Song not found
- `500 Internal Server Error` - Server error

**Screenshot:**

![Delete Song](API_screenshot/delete%20song.png)

---

## Available Genres

- `Pop`
- `Rock`
- `Jazz`
- `Hip-Hop`
- `Country`

## Available Statuses

- `Pending` - Song creation pending
- `Generating` - Song is being generated
- `Completed` - Song generation completed
- `Failed` - Song generation failed

