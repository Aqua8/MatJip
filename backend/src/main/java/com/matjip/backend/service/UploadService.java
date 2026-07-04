package com.matjip.backend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    @Value("${gcs.bucket-name}")
    private String bucketName;

    private final Storage storage = StorageOptions.getDefaultInstance().getService();

    public String upload(MultipartFile file) {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        try {
            storage.create(blobInfo, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
        return "https://storage.googleapis.com/" + bucketName + "/" + filename;
    }

    public void delete(String imageUrl) {
        String prefix = "https://storage.googleapis.com/" + bucketName + "/";
        if (!imageUrl.startsWith(prefix)) {
            return;
        }
        String filename = imageUrl.substring(prefix.length());
        try {
            storage.delete(BlobId.of(bucketName, filename));
        } catch (RuntimeException e) {
            // 정리(cleanup) 목적의 삭제이므로 실패해도 호출부의 주 작업(리뷰 생성/수정/삭제)은 계속 진행한다.
            log.warn("GCS 파일 삭제 실패: {}", imageUrl, e);
        }
    }
}
