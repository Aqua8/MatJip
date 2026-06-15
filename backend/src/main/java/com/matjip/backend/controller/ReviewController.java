package com.matjip.backend.controller;

import com.matjip.backend.dto.ReviewRequest;
import com.matjip.backend.dto.ReviewResponse;
import com.matjip.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/api/restaurants/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> list(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviews(id));
    }

    @PostMapping("/api/restaurants/{id}/reviews")
    public ResponseEntity<ReviewResponse> create(@PathVariable Long id,
                                                  @Valid @RequestBody ReviewRequest req,
                                                  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reviewService.create(id, req, user.getUsername()));
    }

    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<ReviewResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ReviewRequest req,
                                                  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reviewService.update(id, req, user.getUsername()));
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails user) {
        reviewService.delete(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/users/me/reviews")
    public ResponseEntity<List<ReviewResponse>> myReviews(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reviewService.getMyReviews(user.getUsername()));
    }
}
