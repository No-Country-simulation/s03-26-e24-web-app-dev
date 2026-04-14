package com.cmspro.backend.cloudinary;

public record CloudinaryResponse(
        String secureUrl,
        Integer width,
        Integer height,
        String bytes
) {
}
