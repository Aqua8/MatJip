package com.matjip.backend.service;

import com.matjip.backend.domain.*;
import com.matjip.backend.dto.ReviewRequest;
import com.matjip.backend.dto.ReviewResponse;
import com.matjip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final UploadService uploadService;

    private List<String> uploadImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        List<String> uploadedUrls = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                uploadedUrls.add(uploadService.upload(file));
            }
            return uploadedUrls;
        } catch (RuntimeException e) {
            uploadedUrls.forEach(uploadService::delete);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(Long restaurantId) {
        return reviewRepository.findByRestaurantId(restaurantId).stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse create(Long restaurantId, ReviewRequest req, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        List<String> imageUrls = uploadImages(req.getImages());
        try {
            Review review = reviewRepository.save(new Review(user, restaurant, req.getRating(), req.getContent()));
            imageUrls.forEach(url -> reviewImageRepository.save(new ReviewImage(review, url)));
            return new ReviewResponse(review);
        } catch (RuntimeException e) {
            imageUrls.forEach(uploadService::delete);
            throw e;
        }
    }

    @Transactional
    public ReviewResponse update(Long reviewId, ReviewRequest req, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        List<String> keptUrls = req.getExistingImageUrls() != null ? req.getExistingImageUrls() : List.of();
        List<String> removedUrls = review.getImages().stream()
                .map(ReviewImage::getImageUrl)
                .filter(url -> !keptUrls.contains(url))
                .collect(Collectors.toList());
        List<String> newUrls = uploadImages(req.getImages());
        try {
            review.update(req.getRating(), req.getContent());
            review.getImages().removeIf(img -> !keptUrls.contains(img.getImageUrl()));
            newUrls.forEach(url -> review.getImages().add(new ReviewImage(review, url)));
        } catch (RuntimeException e) {
            newUrls.forEach(uploadService::delete);
            throw e;
        }
        removedUrls.forEach(uploadService::delete);
        return new ReviewResponse(review);
    }

    @Transactional
    public void delete(Long reviewId, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        List<String> imageUrls = review.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList());
        reviewRepository.delete(review);
        imageUrls.forEach(uploadService::delete);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reviewRepository.findByUserId(user.getId()).stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }
}
