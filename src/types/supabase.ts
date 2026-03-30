export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Account: {
        Row: {
          id: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          userId?: string
          type?: string
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Relationships: []
      }
      ActivityLog: {
        Row: {
          id: string
          action: string
          entityType: string
          entityId: string
          details: string | null
          userId: string
          taskId: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          action: string
          entityType: string
          entityId: string
          details?: string | null
          userId: string
          taskId?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          action?: string
          entityType?: string
          entityId?: string
          details?: string | null
          userId?: string
          taskId?: string | null
          createdAt?: string
        }
        Relationships: []
      }
      Attachment: {
        Row: {
          id: string
          name: string
          url: string
          size: number
          type: string
          taskId: string
          createdAt: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          size: number
          type: string
          taskId: string
          createdAt?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          size?: number
          type?: string
          taskId?: string
          createdAt?: string
        }
        Relationships: []
      }
      Comment: {
        Row: {
          id: string
          content: string
          taskId: string
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          content: string
          taskId: string
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          content?: string
          taskId?: string
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      EmailMessage: {
        Row: {
          id: string
          messageId: string
          threadId: string | null
          subject: string | null
          snippet: string | null
          sender: string | null
          date: string | null
          read: boolean
          labels: string | null
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          messageId: string
          threadId?: string | null
          subject?: string | null
          snippet?: string | null
          sender?: string | null
          date?: string | null
          read?: boolean
          labels?: string | null
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          messageId?: string
          threadId?: string | null
          subject?: string | null
          snippet?: string | null
          sender?: string | null
          date?: string | null
          read?: boolean
          labels?: string | null
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Goal: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          targetDate: string | null
          period: string | null
          workspaceId: string
          teamId: string | null
          ownerId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          targetDate?: string | null
          period?: string | null
          workspaceId: string
          teamId?: string | null
          ownerId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          targetDate?: string | null
          period?: string | null
          workspaceId?: string
          teamId?: string | null
          ownerId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      KeyResult: {
        Row: {
          id: string
          title: string
          type: string
          currentValue: number
          targetValue: number
          unit: string | null
          goalId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          type?: string
          currentValue?: number
          targetValue: number
          unit?: string | null
          goalId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          currentValue?: number
          targetValue?: number
          unit?: string | null
          goalId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Membership: {
        Row: {
          id: string
          userId: string
          organizationId: string
        }
        Insert: {
          id?: string
          userId: string
          organizationId: string
        }
        Update: {
          id?: string
          userId?: string
          organizationId?: string
        }
        Relationships: []
      }
      Project: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          status: string
          startDate: string | null
          dueDate: string | null
          isPublic: boolean
          brief: string | null
          isTemplate: boolean
          workspaceId: string
          teamId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          status?: string
          startDate?: string | null
          dueDate?: string | null
          isPublic?: boolean
          brief?: string | null
          isTemplate?: boolean
          workspaceId: string
          teamId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          status?: string
          startDate?: string | null
          dueDate?: string | null
          isPublic?: boolean
          brief?: string | null
          isTemplate?: boolean
          workspaceId?: string
          teamId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      ProjectResource: {
        Row: {
          id: string
          title: string
          url: string
          type: string
          projectId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          type?: string
          projectId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          type?: string
          projectId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Section: {
        Row: {
          id: string
          name: string
          order: number
          projectId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          order?: number
          projectId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          order?: number
          projectId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Tag: {
        Row: {
          id: string
          name: string
          color: string
          workspaceId: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          workspaceId: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          workspaceId?: string
        }
        Relationships: []
      }
      Task: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: string
          status: string
          startDate: string | null
          dueDate: string | null
          completed: boolean
          completedAt: string | null
          effort: number | null
          order: number
          projectId: string
          sectionId: string | null
          creatorId: string
          parentId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          startDate?: string | null
          dueDate?: string | null
          completed?: boolean
          completedAt?: string | null
          effort?: number | null
          order?: number
          projectId: string
          sectionId?: string | null
          creatorId: string
          parentId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          startDate?: string | null
          dueDate?: string | null
          completed?: boolean
          completedAt?: string | null
          effort?: number | null
          order?: number
          projectId?: string
          sectionId?: string | null
          creatorId?: string
          parentId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      TaskAssignee: {
        Row: {
          id: string
          userId: string
          taskId: string
        }
        Insert: {
          id?: string
          userId: string
          taskId: string
        }
        Update: {
          id?: string
          userId?: string
          taskId?: string
        }
        Relationships: []
      }
      TaskDependency: {
        Row: {
          id: string
          blockingId: string
          blockedById: string
        }
        Insert: {
          id?: string
          blockingId: string
          blockedById: string
        }
        Update: {
          id?: string
          blockingId?: string
          blockedById?: string
        }
        Relationships: []
      }
      TaskTag: {
        Row: {
          id: string
          taskId: string
          tagId: string
        }
        Insert: {
          id?: string
          taskId: string
          tagId: string
        }
        Update: {
          id?: string
          taskId?: string
          tagId?: string
        }
        Relationships: []
      }
      TimeEntry: {
        Row: {
          id: string
          duration: number
          description: string | null
          date: string
          taskId: string
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          duration: number
          description?: string | null
          date?: string
          taskId: string
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          duration?: number
          description?: string | null
          date?: string
          taskId?: string
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          id: string
          name: string | null
          email: string | null
          emailVerified: string | null
          image: string | null
          bio: string | null
          timezone: string
          language: string
          theme: string
          twoFactorEnabled: boolean
          twoFactorSecret: string | null
          productivityPoints: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
          bio?: string | null
          timezone?: string
          language?: string
          theme?: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          productivityPoints?: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
          bio?: string | null
          timezone?: string
          language?: string
          theme?: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          productivityPoints?: number
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Workspace: {
        Row: {
          id: string
          name: string
          logo: string | null
          domain: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          domain?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          domain?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      WorkspaceMember: {
        Row: {
          id: string
          userId: string
          workspaceId: string
          role: string
        }
        Insert: {
          id?: string
          userId: string
          workspaceId: string
          role?: string
        }
        Update: {
          id?: string
          userId?: string
          workspaceId?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ─── Helper types ───

type PublicSchema = Database["public"]

export type Tables<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][T]["Update"]
