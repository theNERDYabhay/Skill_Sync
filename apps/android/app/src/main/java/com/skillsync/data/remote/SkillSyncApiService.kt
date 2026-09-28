package com.skillsync.data.remote

import com.skillsync.data.model.*
import retrofit2.http.*

interface SkillSyncApiService {
    @GET("auth/me")
    suspend fun getCurrentUser(): Map<String, Any>

    @GET("recommendations/candidates")
    suspend fun getCandidateRecommendations(): Map<String, Any>

    @GET("recommendations/teams-for-user")
    suspend fun getTeamRecommendations(): Map<String, Any>

    @GET("opportunities")
    suspend fun getOpportunities(): Map<String, Any>

    @GET("teams")
    suspend fun getTeams(): Map<String, Any>

    @POST("connections/request")
    suspend fun sendConnectionRequest(
        @Body payload: Map<String, String>
    ): Map<String, Any>

    @GET("messages/conversations")
    suspend fun getConversations(): Map<String, Any>

    @POST("messages/send")
    suspend fun sendMessage(
        @Body payload: Map<String, String>
    ): Map<String, Any>
}
