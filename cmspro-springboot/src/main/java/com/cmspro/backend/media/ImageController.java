package com.cmspro.backend.media;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<Image> upload(@RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(cloudinaryService.uploadAndSave(file));
    }

    @GetMapping
    public ResponseEntity<List<Image>> getAll() {
        return ResponseEntity.ok(cloudinaryService.findAll());
    }
}