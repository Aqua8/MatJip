package com.matjip.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@Service
public class UploadService {
    // GCS 연동 전 stub — UUID 기반 경로 반환
    public String upload(MultipartFile file) {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        return "https://storage.googleapis.com/matjip-bucket/" + filename;
    }
}
