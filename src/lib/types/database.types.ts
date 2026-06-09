export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_simulator_defects: {
        Row: {
          created_at: string;
          evaluation_criteria: string;
          feedback_correct: string;
          id: string;
          is_active: boolean;
          scenario_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          evaluation_criteria: string;
          feedback_correct: string;
          id: string;
          is_active?: boolean;
          scenario_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          evaluation_criteria?: string;
          feedback_correct?: string;
          id?: string;
          is_active?: boolean;
          scenario_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      ai_simulator_scenarios: {
        Row: {
          created_at: string;
          id: string;
          instructions: string;
          is_published: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          instructions: string;
          is_published?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          instructions?: string;
          is_published?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_simulator_submissions: {
        Row: {
          created_at: string;
          feedback: string;
          id: string;
          matched_defect_id: string | null;
          report: string;
          scenario_id: string;
          session_id: string;
          user_id: string | null;
          verdict: string;
        };
        Insert: {
          created_at?: string;
          feedback: string;
          id?: string;
          matched_defect_id?: string | null;
          report: string;
          scenario_id: string;
          session_id: string;
          user_id?: string | null;
          verdict: string;
        };
        Update: {
          created_at?: string;
          feedback?: string;
          id?: string;
          matched_defect_id?: string | null;
          report?: string;
          scenario_id?: string;
          session_id?: string;
          user_id?: string | null;
          verdict?: string;
        };
        Relationships: [];
      };
      ai_simulator_tasks: {
        Row: {
          description: string;
          id: string;
          order_index: number;
          scenario_id: string;
          title: string;
        };
        Insert: {
          description: string;
          id: string;
          order_index: number;
          scenario_id: string;
          title: string;
        };
        Update: {
          description?: string;
          id?: string;
          order_index?: number;
          scenario_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string | null;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          content: Json;
          created_at: string;
          description: string | null;
          id: string;
          is_published: boolean;
          language: string;
          module_id: string;
          module_number: number;
          order_index: number;
          quiz_id: string | null;
          slug: string;
          source_language: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_published?: boolean;
          language?: string;
          module_id: string;
          module_number: number;
          order_index: number;
          quiz_id?: string | null;
          slug: string;
          source_language?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_published?: boolean;
          language?: string;
          module_id?: string;
          module_number?: number;
          order_index?: number;
          quiz_id?: string | null;
          slug?: string;
          source_language?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string | null;
          created_at: string | null;
          id: string;
          sender: string;
        };
        Insert: {
          content: string;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: string;
          sender: string;
        };
        Update: {
          content?: string;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: string;
          sender?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      quiz_options: {
        Row: {
          id: string;
          is_correct: boolean;
          label: string;
          order_index: number;
          question_id: string;
        };
        Insert: {
          id?: string;
          is_correct?: boolean;
          label: string;
          order_index: number;
          question_id: string;
        };
        Update: {
          id?: string;
          is_correct?: boolean;
          label?: string;
          order_index?: number;
          question_id?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          created_at: string;
          explanation: string | null;
          id: string;
          order_index: number;
          prompt: string;
          quiz_id: string;
          selection_mode: string;
        };
        Insert: {
          created_at?: string;
          explanation?: string | null;
          id?: string;
          order_index: number;
          prompt: string;
          quiz_id: string;
          selection_mode?: string;
        };
        Update: {
          created_at?: string;
          explanation?: string | null;
          id?: string;
          order_index?: number;
          prompt?: string;
          quiz_id?: string;
          selection_mode?: string;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          created_at: string;
          id: string;
          is_published: boolean;
          max_points: number;
          passing_score: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          is_published?: boolean;
          max_points?: number;
          passing_score?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          max_points?: number;
          passing_score?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          created_at: string;
          id: string;
          points_awarded: number;
          quiz_id: string;
          score: number;
          score_percent: number;
          total_questions: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          points_awarded?: number;
          quiz_id: string;
          score: number;
          score_percent: number;
          total_questions: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          points_awarded?: number;
          quiz_id?: string;
          score?: number;
          score_percent?: number;
          total_questions?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_gamification: {
        Row: {
          level: number;
          level_name: string;
          total_points: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          level?: number;
          level_name?: string;
          total_points?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          level?: number;
          level_name?: string;
          total_points?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_daily_activity: {
        Row: {
          activity_date: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          activity_date?: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          activity_date?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_streaks: {
        Row: {
          current_streak: number;
          last_activity_date: string | null;
          longest_streak: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          current_streak?: number;
          last_activity_date?: string | null;
          longest_streak?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          current_streak?: number;
          last_activity_date?: string | null;
          longest_streak?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_quiz_progress: {
        Row: {
          attempt_count: number;
          best_score_percent: number;
          completed_100: boolean;
          points_earned: number;
          quiz_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_count?: number;
          best_score_percent?: number;
          completed_100?: boolean;
          points_earned?: number;
          quiz_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_count?: number;
          best_score_percent?: number;
          completed_100?: boolean;
          points_earned?: number;
          quiz_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          created_at: string | null;
          id: number;
          key: string;
          prompt: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          key: string;
          prompt: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          key?: string;
          prompt?: string;
        };
        Relationships: [];
      };
      sidebar_groups: {
        Row: {
          group_id: string;
          group_name: string;
          icon: string;
          open_icon: string;
          position: number;
        };
        Insert: {
          group_id?: string;
          group_name: string;
          icon: string;
          open_icon: string;
          position?: number;
        };
        Update: {
          group_id?: string;
          group_name?: string;
          icon?: string;
          open_icon?: string;
          position?: number;
        };
        Relationships: [];
      };
      sidebar_items: {
        Row: {
          group_id: string;
          item_icon: string | null;
          item_id: string;
          item_name: string;
          position: number;
        };
        Insert: {
          group_id: string;
          item_icon?: string | null;
          item_id?: string;
          item_name: string;
          position?: number;
        };
        Update: {
          group_id?: string;
          item_icon?: string | null;
          item_id?: string;
          item_name?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'sidebar_items_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'sidebar_groups';
            referencedColumns: ['group_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_conversation_by_id: {
        Args: { p_conversation_id: string };
        Returns: {
          sender: string;
          content: string;
          created_at: string;
        }[];
      };
      get_prompt: {
        Args: { p_key: string };
        Returns: string;
      };
      get_sidebar_structure: {
        Args: Record<PropertyKey, never>;
        Returns: {
          group_id: string;
          group_name: string;
          icon: string;
          open_icon: string;
          position: number;
          sidebar_items: Json;
        }[];
      };
      record_quiz_attempt: {
        Args: {
          p_quiz_id: string;
          p_score: number;
          p_total_questions: number;
          p_user_id: string;
        };
        Returns: Json;
      };
      record_daily_activity: {
        Args: { p_user_id: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
