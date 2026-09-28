package com.skillsync.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    val id: String,
    val email: String,
    val username: String,
    val name: String,
    val avatar: String,
    val headline: String,
    val bio: String,
    val location: String,
    val role: String,
    val mode: String,
    val availability: String,
    val commitmentHoursPerWeek: Int,
    val goals: List<String>,
    val skills: List<UserSkill>,
    val lookingForSkills: List<String>,
    val completenessScore: Int,
    val github: GitHubProfile?,
    val leetcode: LeetCodeProfile?
)

data class UserSkill(
    val id: String,
    val name: String,
    val category: String,
    val proficiency: String,
    val verified: Boolean
)

data class GitHubProfile(
    val connected: Boolean,
    val username: String?,
    val publicReposCount: Int?,
    val topLanguages: List<TopLanguage>?
)

data class TopLanguage(
    val language: String,
    val percentage: Int
)

data class LeetCodeProfile(
    val connected: Boolean,
    val username: String?,
    val totalSolved: Int?,
    val contestRating: Int?
)

data class RecommendationBreakdown(
    val overallScore: Int,
    val skillComplementarity: Int,
    val semanticSimilarity: Int,
    val reasons: List<String>,
    val missingSkillsSupplied: List<String>,
    val complementarySkills: List<String>
)

data class CandidateRecommendation(
    val user: UserProfile,
    val recommendation: RecommendationBreakdown
)

data class Team(
    val id: String,
    val name: String,
    val logo: String,
    val tagline: String,
    val description: String,
    val techStack: List<String>,
    val teamSizeMax: Int,
    val opportunityType: String
)

data class Opportunity(
    val id: String,
    val title: String,
    val organizer: String,
    val type: String,
    val prizePool: String?,
    val deadline: String,
    val description: String,
    val requiredSkills: List<String>,
    val totalParticipants: Int
)

data class ChatMessage(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val senderAvatar: String,
    val content: String,
    val createdAt: String
)
