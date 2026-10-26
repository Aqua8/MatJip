package com.matjip.backend.service;

import com.matjip.backend.domain.*;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final RestaurantResponseAssembler responseAssembler;

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getBookmarks(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Restaurant> restaurants = bookmarkRepository.findByUserIdWithRestaurant(user.getId()).stream()
                .map(Bookmark::getRestaurant)
                .collect(Collectors.toList());
        return responseAssembler.toResponses(restaurants, user.getId());
    }

    @Transactional
    public Map<String, Boolean> toggle(Long restaurantId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndRestaurantId(user.getId(), restaurantId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return Map.of("bookmarked", false);
        } else {
            try {
                bookmarkRepository.saveAndFlush(new Bookmark(user, restaurant));
            } catch (DataIntegrityViolationException e) {
                // 동시 요청으로 다른 트랜잭션이 먼저 즐겨찾기를 등록한 경우
            }
            return Map.of("bookmarked", true);
        }
    }
}
