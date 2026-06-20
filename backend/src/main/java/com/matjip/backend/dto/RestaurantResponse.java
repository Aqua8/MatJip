package com.matjip.backend.dto;

import com.matjip.backend.domain.Restaurant;
import lombok.Getter;

@Getter
public class RestaurantResponse {
    private Long id;
    private String kakaoPlaceId;
    private String name;
    private String address;
    private String category;
    private Double lat;
    private Double lng;
    private long likeCount;
    private Double avgRating;
    private boolean liked;
    private String thumbnailUrl;

    public RestaurantResponse(Restaurant r, long likeCount, Double avgRating, boolean liked, String thumbnailUrl) {
        this.id = r.getId();
        this.kakaoPlaceId = r.getKakaoPlaceId();
        this.name = r.getName();
        this.address = r.getAddress();
        this.category = r.getCategory();
        this.lat = r.getLat();
        this.lng = r.getLng();
        this.likeCount = likeCount;
        this.avgRating = avgRating;
        this.liked = liked;
        this.thumbnailUrl = thumbnailUrl;
    }
}
