package com.matjip.backend.dto;

import com.matjip.backend.domain.Review;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String nickname;
    private byte rating;
    private String content;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private Long restaurantId;
    private String restaurantName;

    public ReviewResponse(Review r) {
        this.id = r.getId();
        this.userId = r.getUser().getId();
        this.nickname = r.getUser().getNickname();
        this.rating = r.getRating();
        this.content = r.getContent();
        this.imageUrls = r.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList());
        this.createdAt = r.getCreatedAt();
        this.restaurantId = r.getRestaurant().getId();
        this.restaurantName = r.getRestaurant().getName();
    }
}
