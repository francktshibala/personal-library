{
  "openapi": "3.0.0",
  "info": {
    "title": "Personal Library API",
    "version": "1.0.0",
    "description": "API for managing a personal book collection, authors, and loan records with authentication"
  },
  "servers": [
    {
      "url": "/api",
      "description": "API Server"
    }
  ],
  "tags": [
    {
      "name": "Authentication",
      "description": "Operations related to user authentication"
    },
    {
      "name": "Books",
      "description": "Operations related to books"
    },
    {
      "name": "Authors",
      "description": "Operations related to authors"
    },
    {
      "name": "Loans",
      "description": "Operations related to book loans"
    }
  ],
  "paths": {
    "/books": {
      "get": {
        "tags": ["Books"],
        "summary": "Get all books",
        "description": "Retrieve a list of all books with filtering and pagination",
        "parameters": [
          {
            "in": "query",
            "name": "genre",
            "schema": {
              "type": "string"
            },
            "description": "Filter by genre"
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Page number"
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 10
            },
            "description": "Results per page"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved books",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Book"
                      }
                    }
                  }
                },
                "example": {
                  "success": true,
                  "data": [
                    {
                      "_id": "book1",
                      "title": "Book Title 1",
                      "author": "Author 1",
                      "genre": "Fiction"
                    }
                  ]
                }
              }
            }
          },
          "500": {
            "description": "Internal server error"
          }
        }
      },
      "post": {
        "tags": ["Books"],
        "summary": "Create a new book",
        "description": "Add a new book to the collection",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BookInput"
              },
              "example": {
                "title": "New Book",
                "author": "Author ID",
                "genre": "Fiction"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Book created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Book"
                }
              }
            }
          },
          "400": {
            "description": "Bad request - validation error"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/books/{id}": {
      "get": {
        "tags": ["Books"],
        "summary": "Get a book by ID",
        "description": "Retrieve a single book by its ID",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The ID of the book to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved book",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Book"
                }
              }
            }
          },
          "404": {
            "description": "Book not found"
          }
        }
      },
      "put": {
        "tags": ["Books"],
        "summary": "Update a book by ID",
        "description": "Update the details of an existing book",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The ID of the book to update"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BookInput"
              },
              "example": {
                "title": "Updated Book Title",
                "author": "Updated Author ID",
                "genre": "Updated Genre"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully updated book",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Book"
                }
              }
            }
          },
          "400": {
            "description": "Bad request - validation error"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Book not found"
          }
        }
      },
      "delete": {
        "tags": ["Books"],
        "summary": "Delete a book by ID",
        "description": "Remove a book from the collection",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The ID of the book to delete"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully deleted book"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Book not found"
          }
        }
      }
    },
    "/loans": {
      "get": {
        "tags": ["Loans"],
        "summary": "Get all loans",
        "description": "Retrieve a list of all loan records with filtering and pagination",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "status",
            "schema": {
              "type": "string",
              "enum": ["Active", "Returned", "Overdue"]
            },
            "description": "Filter by status"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved loan records",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/LoanRecord"
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    }
    // Add similar CRUD operations for Authors and Loans...
  },
  "components": {
    "schemas": {
      "Book": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "author": {
            "type": "string"
          },
          "genre": {
            "type": "string"
          }
        }
      },
      "BookInput": {
        "type": "object",
        "required": ["title", "author", "genre"],
        "properties": {
          "title": {
            "type": "string"
          },
          "author": {
            "type": "string"
          },
          "genre": {
            "type": "string"
          }
        }
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}