# YTECH API Documentation

## 📡 Endpoints

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## 📝 Contact API

### POST /api/contact
Envoi d'un message depuis le formulaire de contact.

**Request Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com", 
  "subject": "Demande de renseignements",
  "message": "Bonjour, je souhaite en savoir plus sur vos services..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message envoyé avec succès!",
  "data": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "subject": "Demande de renseignements",
    "message": "Bonjour, je souhaite en savoir plus..."
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": "All fields are required"
}
```

### GET /api/contacts
Récupération des messages (admin uniquement).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "subject": "Demande de renseignements",
      "message": "Bonjour...",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 💰 Quote API

### POST /api/quote
Demande de devis pour un service.

**Request Body:**
```json
{
  "name": "Marie Martin",
  "email": "marie@entreprise.com",
  "company": "Tech Solutions",
  "phone": "+212 6 12 34 56 78",
  "service_type": "ecommerce",
  "budget": "medium",
  "description": "Boutique en ligne avec 500 produits..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Demande de devis envoyée avec succès!",
  "data": {
    "id": 1,
    "name": "Marie Martin",
    "email": "marie@entreprise.com",
    "company": "Tech Solutions",
    "service_type": "ecommerce"
  }
}
```

### GET /api/quotes
Récupération des demandes de devis (admin uniquement).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Marie Martin",
      "email": "marie@entreprise.com",
      "company": "Tech Solutions",
      "service_type": "ecommerce",
      "budget": "medium",
      "status": "pending",
      "created_at": "2024-01-15T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

## 🏥 Health Check

### GET /api/health
Vérification de l'état du serveur et de la base de données.

**Response (200):**
```json
{
  "status": "Server is running",
  "database": "Connected (MariaDB)",
  "timestamp": "2024-01-15T15:30:00.000Z",
  "version": "10.6.5-MariaDB",
  "uptime": 3600.5,
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  }
}
```

**Response (500):**
```json
{
  "status": "Server is running",
  "database": "Disconnected",
  "error": "Connection refused"
}
```

## 🔒 Rate Limiting

- **Limite**: 100 requêtes par IP toutes les 15 minutes
- **Response (429):**
```json
{
  "error": "Too many requests, please try again later"
}
```

## ❌ Erreurs

### Format d'Erreur Standard
```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

### Codes d'Erreur
- `400` : Bad Request - Validation échouée
- `404` : Not Found - Endpoint inexistant
- `429` : Too Many Requests - Rate limit dépassé
- `500` : Internal Server Error - Erreur serveur

## 🔧 Headers

### CORS
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### Content-Type
```
Content-Type: application/json
```

## 📝 Exemples d'Utilisation

### JavaScript (Fetch)
```javascript
// Envoyer un message de contact
fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jean Dupont',
    email: 'jean@example.com',
    subject: 'Test',
    message: 'Message de test'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Envoyer un message
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Hello"}'
```

---

**YTECH API** - Interface simple et sécurisée pour votre site web
