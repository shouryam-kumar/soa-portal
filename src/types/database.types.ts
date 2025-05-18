export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          deadline: string
          deliverables: string[] | null
          description: string
          feedback: string | null
          id: string
          points_allocated: number
          proposal_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deadline: string
          deliverables?: string[] | null
          description: string
          feedback?: string | null
          id?: string
          points_allocated: number
          proposal_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deadline?: string
          deliverables?: string[] | null
          description?: string
          feedback?: string | null
          id?: string
          points_allocated?: number
          proposal_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_proposal_id_fkey"
            columns: ["proposal_id"]
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          okto_points: number | null
          role: string | null
          skills: string[] | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
          profile_completed: boolean | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          okto_points?: number | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
          profile_completed?: boolean | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          okto_points?: number | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
          profile_completed?: boolean | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_updates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          posted_by: string
          project_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          posted_by: string
          project_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          posted_by?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_posted_by_fkey"
            columns: ["posted_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          leader_id: string
          points_distributed: number | null
          proposal_id: string
          repository: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          leader_id: string
          points_distributed?: number | null
          proposal_id: string
          repository?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          leader_id?: string
          points_distributed?: number | null
          proposal_id?: string
          repository?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_leader_id_fkey"
            columns: ["leader_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_proposal_id_fkey"
            columns: ["proposal_id"]
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          }
        ]
      }
      proposals: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string
          fields: string[] | null
          id: string
          review_feedback: string | null
          short_description: string
          skills_required: string[] | null
          status: string | null
          title: string
          total_points: number
          type: string
          updated_at: string | null
          deadline: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description: string
          fields?: string[] | null
          id?: string
          review_feedback?: string | null
          short_description: string
          skills_required?: string[] | null
          status?: string | null
          title: string
          total_points: number
          type: string
          updated_at?: string | null
          deadline?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string
          fields?: string[] | null
          id?: string
          review_feedback?: string | null
          short_description?: string
          skills_required?: string[] | null
          status?: string | null
          title?: string
          total_points?: number
          type?: string
          updated_at?: string | null
          deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      submissions: {
        Row: {
          approved: boolean | null
          content: string
          created_at: string | null
          feedback: string | null
          id: string
          links: string[] | null
          milestone_id: string
          submitted_by: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          content: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          links?: string[] | null
          milestone_id: string
          submitted_by: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          content?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          links?: string[] | null
          milestone_id?: string
          submitted_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_milestone_id_fkey"
            columns: ["milestone_id"]
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // Add new admin-specific tables
      proposal_comments: {
        Row: {
          id: string
          proposal_id: string
          user_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          proposal_id: string
          user_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          proposal_id?: string
          user_id?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_comments_proposal_id_fkey"
            columns: ["proposal_id"]
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      status_history: {
        Row: {
          id: string
          proposal_id: string
          changed_by: string
          old_status: string
          new_status: string
          feedback: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          proposal_id: string
          changed_by: string
          old_status: string
          new_status: string
          feedback?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          proposal_id?: string
          changed_by?: string
          old_status?: string
          new_status?: string
          feedback?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_history_proposal_id_fkey"
            columns: ["proposal_id"]
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_changed_by_fkey"
            columns: ["changed_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          type: string
          reference_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          type: string
          reference_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          type?: string
          reference_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bounty_submissions: {
        Row: {
          id: string;
          bounty_id: string;
          submitter_id: string;
          title: string;
          description: string;
          submission_url: string | null;
          submission_text: string | null;
          status: string;
          points_awarded: number | null;
          feedback: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          bounty_id: string;
          submitter_id: string;
          title: string;
          description: string;
          submission_url?: string | null;
          submission_text?: string | null;
          status?: string;
          points_awarded?: number | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          bounty_id?: string;
          submitter_id?: string;
          title?: string;
          description?: string;
          submission_url?: string | null;
          submission_text?: string | null;
          status?: string;
          points_awarded?: number | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bounty_submissions_bounty_id_fkey";
            columns: ["bounty_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bounty_submissions_submitter_id_fkey";
            columns: ["submitter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_project_from_proposal: {
        Args: {
          proposal_uuid: string
        }
        Returns: string
      }
      increment_points: {
        Args: {
          user_uuid: string
          points: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}