package com.matjip.backend.service;

import com.matjip.backend.domain.Restaurant;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.repository.LikeRepository;
import com.matjip.backend.repository.ReviewImageRepository;
import com.matjip.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 맛집 목록 응답을 만든다. 좋아요 수·평균 별점·썸네일·좋아요 여부를 맛집마다 따로 조회하지 않고
 * 목록 전체에 대해 한 번씩만 조회해(맛집 N개여도 쿼리 3~4개) N+1을 피한다.
 */
@Component
@RequiredArgsConstructor
public class RestaurantResponseAssembler {
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    /** userId가 null이면 liked는 모두 false */
    public List<RestaurantResponse> toResponses(List<Restaurant> restaurants, Long userId) {
        if (restaurants.isEmpty()) {
            return List.of();
        }
        List<Long> ids = restaurants.stream().map(Restaurant::getId).collect(Collectors.toList());

        Map<Long, Long> likeCounts = new HashMap<>();
        for (Object[] row : likeRepository.countGroupedByRestaurantIds(ids)) {
            likeCounts.put((Long) row[0], (Long) row[1]);
        }
        Map<Long, Double> avgRatings = new HashMap<>();
        for (Object[] row : reviewRepository.avgRatingGroupedByRestaurantIds(ids)) {
            avgRatings.put((Long) row[0], (Double) row[1]);
        }
        Map<Long, String> thumbnails = new HashMap<>();
        for (Object[] row : reviewImageRepository.findLatestImageUrlByRestaurantIds(ids)) {
            thumbnails.put((Long) row[0], (String) row[1]);
        }
        Set<Long> likedIds = userId == null
                ? Set.of()
                : new HashSet<>(likeRepository.findLikedRestaurantIds(userId, ids));

        return restaurants.stream()
                .map(r -> new RestaurantResponse(r,
                        likeCounts.getOrDefault(r.getId(), 0L),
                        avgRatings.get(r.getId()),
                        likedIds.contains(r.getId()),
                        thumbnails.get(r.getId())))
                .collect(Collectors.toList());
    }
}
