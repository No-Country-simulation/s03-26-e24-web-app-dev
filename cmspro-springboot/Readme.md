## API con Cloudinary

### Descripción
Este endpoint permite subir una imagen desde el frontend al backend.

Luego, el backend procesa la imagen, la sube a Cloudinary y devuelve la URL segura junto con metadatos básicos.

### Endpoint
```
POST https://cmspro.yoshua-cloud.duckdns.org/api/images/upload
```

### Headers
| Key           | Value                     |
|---------------|---------------------------|
| Content-Type  | multipart/form-data       |

### Body (Form Data)
| Campo     | Tipo       | Descripción                     |
|-----------|------------|---------------------------------|
| image     | file       | Archivo de imagen (JPG, PNG, WEBP) |

### Ejemplo de Request (JavaScript - Fetch API)
```javascript
const formData = new FormData();
formData.append('file', file);

fetch('https://cmspro.yoshua-cloud.duckdns.org/api/images/upload', {
  method: 'POST',
  body: formData,
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Respuesta Exitosa (200 OK)
```json
{
  "secureUrl": "https://res.cloudinary.com/dzm6es3kl/image/upload/v1776203356/jt6qmps3iiydusrpovtn.webp",
  "width": 700,
  "height": 420,
  "bytes": "16.54 KB"
}
```

### Campos de la Respuesta
| Campo      | Tipo    | Descripción                     |
|------------|---------|---------------------------------|
| secureUrl  | string  | URL pública de la imagen en Cloudinary |
| width      | integer | Ancho de la imagen en píxeles   |
| height     | integer | Alto de la imagen en píxeles    |
| bytes      | string  | Tamaño de la imagen en KB       |

### Posibles Errores
- 400 Bad Request: Archivo no es una imagen válida o no se adjuntó.
- 500 Internal Server Error: Error al procesar la imagen en el servidor.
