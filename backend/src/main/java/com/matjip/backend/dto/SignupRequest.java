package com.matjip.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class SignupRequest {
    @Email @NotBlank
    private String email;

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&]).{8,}$",
        message = "비밀번호는 영문, 숫자, 특수문자(@$!%*#?&)를 포함한 8자 이상이어야 합니다."
    )
    private String password;

    @NotBlank
    private String nickname;
}
