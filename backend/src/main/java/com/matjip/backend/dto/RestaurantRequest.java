package com.matjip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RestaurantRequest {
    @NotBlank
    private String kakaoPlaceId;
    @NotBlank
    private String name;
    private String address;
    private String category;
    private Double lat;
    private Double lng;
}
