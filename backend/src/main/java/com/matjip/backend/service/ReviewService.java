package com.matjip.backend.service;

import com.matjip.backend.domain.*;
import com.matjip.backend.dto.ReviewRequest;
import com.matjip.backend.dto.ReviewResponse;
import com.matjip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

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
        Review review = reviewRepository.save(new Review(user, restaurant, req.getRating(), req.getContent()));
        if (req.getImageUrls() != null) {
            req.getImageUrls().forEach(url -> reviewImageRepository.save(new ReviewImage(review, url)));
        }
        return new ReviewResponse(review);
    }

    @Transactional
    public ReviewResponse update(Long reviewId, ReviewRequest req, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        review.update(req.getRating(), req.getContent());
        reviewImageRepository.deleteAll(review.getImages());
        review.getImages().clear();
        if (req.getImageUrls() != null) {
            req.getImageUrls().forEach(url -> reviewImageRepository.save(new ReviewImage(review, url)));
        }
        return new ReviewResponse(review);
    }

    @Transactional
    public void delete(Long reviewId, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reviewRepository.findByUserId(user.getId()).stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }
}
