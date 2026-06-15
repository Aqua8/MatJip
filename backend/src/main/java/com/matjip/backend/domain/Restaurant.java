package com.matjip.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants")
@Getter
@NoArgsConstructor
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kakao_place_id", nullable = false, unique = true)
    private String kakaoPlaceId;

    @Column(nullable = false)
    private String name;

    private String address;
    private String category;
    private Double lat;
    private Double lng;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Restaurant(String kakaoPlaceId, String name, String address, String category, Double lat, Double lng) {
        this.kakaoPlaceId = kakaoPlaceId;
        this.name = name;
        this.address = address;
        this.category = category;
        this.lat = lat;
        this.lng = lng;
    }
}
