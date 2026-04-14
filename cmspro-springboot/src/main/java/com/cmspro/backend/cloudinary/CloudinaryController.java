package com.cmspro.backend.cloudinary;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<CloudinaryResponse> upload(@RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(cloudinaryService.uploadAndGetUrl(file));
    }

}