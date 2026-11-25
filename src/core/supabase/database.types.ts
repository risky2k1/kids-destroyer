
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "assignments": {
                  Row: {
                    "assigned_by": string,"created_at": string,"due_at": string | null,"id": string,"kid_id": string,"parent_comment": string | null,"quiz_id": string,"status": Database["public"]['Enums']["assignment_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_by"?: string,"created_at"?: string,"due_at"?: string | null,"id"?: string,"kid_id": string,"parent_comment"?: string | null,"quiz_id": string,"status"?: Database["public"]['Enums']["assignment_status"]
                  }
                  Update: {
                    "assigned_by"?: string,"created_at"?: string,"due_at"?: string | null,"id"?: string,"kid_id"?: string,"parent_comment"?: string | null,"quiz_id"?: string,"status"?: Database["public"]['Enums']["assignment_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "assignments_assigned_by_fkey"
      columns: ["assigned_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assignments_kid_id_fkey"
      columns: ["kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assignments_quiz_id_fkey"
      columns: ["quiz_id"]
isOneToOne: false
      referencedRelation: "quizzes"
      referencedColumns: ["id"]
    }
                  ]
                },"attempts": {
                  Row: {
                    "assignment_id": string,"id": string,"round": number,"score": number | null,"started_at": string,"submitted_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "assignment_id": string,"id"?: string,"round": number,"score"?: number | null,"started_at"?: string,"submitted_at"?: string | null
                  }
                  Update: {
                    "assignment_id"?: string,"id"?: string,"round"?: number,"score"?: number | null,"started_at"?: string,"submitted_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempts_assignment_id_fkey"
      columns: ["assignment_id"]
isOneToOne: false
      referencedRelation: "assignments"
      referencedColumns: ["id"]
    }
                  ]
                },"families": {
                  Row: {
                    "created_at": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"grades": {
                  Row: {
                    "id": string,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string,"sort"?: number
                  }
                  Update: {
                    "id"?: string,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"kids": {
                  Row: {
                    "avatar": string,"created_at": string,"display_name": string,"family_id": string,"grade_id": string,"id": string,"pin_failed_count": number,"pin_hash": string,"pin_locked_until": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar": string,"created_at"?: string,"display_name": string,"family_id": string,"grade_id": string,"id"?: string,"pin_failed_count"?: number,"pin_hash": string,"pin_locked_until"?: string | null
                  }
                  Update: {
                    "avatar"?: string,"created_at"?: string,"display_name"?: string,"family_id"?: string,"grade_id"?: string,"id"?: string,"pin_failed_count"?: number,"pin_hash"?: string,"pin_locked_until"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "kids_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "kids_grade_id_fkey"
      columns: ["grade_id"]
isOneToOne: false
      referencedRelation: "grades"
      referencedColumns: ["id"]
    }
                  ]
                },"modules": {
                  Row: {
                    "enabled": boolean,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "enabled"?: boolean,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "enabled"?: boolean,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"plc_place_tags": {
                  Row: {
                    "place_id": string,"tag_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "place_id": string,"tag_id": string
                  }
                  Update: {
                    "place_id"?: string,"tag_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plc_place_tags_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "plc_places"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plc_place_tags_tag_id_fkey"
      columns: ["tag_id"]
isOneToOne: false
      referencedRelation: "plc_tags"
      referencedColumns: ["id"]
    }
                  ]
                },"plc_places": {
                  Row: {
                    "created_at": string,"dishes": string | null,"id": string,"maps_url": string | null,"name": string,"note": string | null,"open_hours": NonNullable<Json>,"photos": (string)[],"price_level": number | null,"rating": number | null,"status": string,"updated_at": string,"visited_on": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dishes"?: string | null,"id"?: string,"maps_url"?: string | null,"name": string,"note"?: string | null,"open_hours"?: NonNullable<Json>,"photos"?: (string)[],"price_level"?: number | null,"rating"?: number | null,"status"?: string,"updated_at"?: string,"visited_on"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"dishes"?: string | null,"id"?: string,"maps_url"?: string | null,"name"?: string,"note"?: string | null,"open_hours"?: NonNullable<Json>,"photos"?: (string)[],"price_level"?: number | null,"rating"?: number | null,"status"?: string,"updated_at"?: string,"visited_on"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"plc_tags": {
                  Row: {
                    "created_at": string,"emoji": string | null,"icon": string | null,"id": string,"kind": string,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"emoji"?: string | null,"icon"?: string | null,"id"?: string,"kind": string,"name": string,"sort"?: number
                  }
                  Update: {
                    "created_at"?: string,"emoji"?: string | null,"icon"?: string | null,"id"?: string,"kind"?: string,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"plc_visits": {
                  Row: {
                    "created_at": string,"id": string,"note": string | null,"place_id": string,"rating": number | null,"visited_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"note"?: string | null,"place_id": string,"rating"?: number | null,"visited_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"note"?: string | null,"place_id"?: string,"rating"?: number | null,"visited_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plc_visits_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "plc_places"
      referencedColumns: ["id"]
    }
                  ]
                },"plugins": {
                  Row: {
                    "enabled": boolean,"id": string,"settings": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "enabled"?: boolean,"id": string,"settings"?: NonNullable<Json>
                  }
                  Update: {
                    "enabled"?: boolean,"id"?: string,"settings"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string,"family_id": string | null,"id": string,"role_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"family_id"?: string | null,"id": string,"role_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"family_id"?: string | null,"id"?: string,"role_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "profiles_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"questions": {
                  Row: {
                    "answer": NonNullable<Json>,"archived_at": string | null,"content": NonNullable<Json>,"created_at": string,"created_by": string,"grade_id": string,"id": string,"lang": Database["public"]['Enums']["question_lang"],"prompt": string,"subject_id": string,"topic_id": string | null,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer"?: NonNullable<Json>,"archived_at"?: string | null,"content"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string,"grade_id": string,"id"?: string,"lang"?: Database["public"]['Enums']["question_lang"],"prompt": string,"subject_id": string,"topic_id"?: string | null,"type": string
                  }
                  Update: {
                    "answer"?: NonNullable<Json>,"archived_at"?: string | null,"content"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string,"grade_id"?: string,"id"?: string,"lang"?: Database["public"]['Enums']["question_lang"],"prompt"?: string,"subject_id"?: string,"topic_id"?: string | null,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_grade_id_fkey"
      columns: ["grade_id"]
isOneToOne: false
      referencedRelation: "grades"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_subject_id_fkey"
      columns: ["subject_id"]
isOneToOne: false
      referencedRelation: "subjects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_topic_id_fkey"
      columns: ["topic_id"]
isOneToOne: false
      referencedRelation: "topics"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_questions": {
                  Row: {
                    "points": number,"position": number,"question_id": string,"quiz_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "points"?: number,"position": number,"question_id": string,"quiz_id": string
                  }
                  Update: {
                    "points"?: number,"position"?: number,"question_id"?: string,"quiz_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_questions_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_questions_quiz_id_fkey"
      columns: ["quiz_id"]
isOneToOne: false
      referencedRelation: "quizzes"
      referencedColumns: ["id"]
    }
                  ]
                },"quizzes": {
                  Row: {
                    "archived_at": string | null,"created_at": string,"created_by": string,"grade_id": string,"id": string,"subject_id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"created_at"?: string,"created_by"?: string,"grade_id": string,"id"?: string,"subject_id": string,"title": string
                  }
                  Update: {
                    "archived_at"?: string | null,"created_at"?: string,"created_by"?: string,"grade_id"?: string,"id"?: string,"subject_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quizzes_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quizzes_grade_id_fkey"
      columns: ["grade_id"]
isOneToOne: false
      referencedRelation: "grades"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quizzes_subject_id_fkey"
      columns: ["subject_id"]
isOneToOne: false
      referencedRelation: "subjects"
      referencedColumns: ["id"]
    }
                  ]
                },"responses": {
                  Row: {
                    "attempt_id": string,"auto_score": number | null,"feedback": string | null,"id": string,"manual_score": number | null,"media_path": string | null,"question_id": string,"response": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id": string,"auto_score"?: number | null,"feedback"?: string | null,"id"?: string,"manual_score"?: number | null,"media_path"?: string | null,"question_id": string,"response"?: Json | null
                  }
                  Update: {
                    "attempt_id"?: string,"auto_score"?: number | null,"feedback"?: string | null,"id"?: string,"manual_score"?: number | null,"media_path"?: string | null,"question_id"?: string,"response"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "responses_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "responses_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"role_permissions": {
                  Row: {
                    "permission": string,"role_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "permission": string,"role_id": string
                  }
                  Update: {
                    "permission"?: string,"role_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "role_permissions_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "created_at": string,"id": string,"is_system": boolean,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"is_system"?: boolean,"name": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_system"?: boolean,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"settings": {
                  Row: {
                    "key": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "key": string,"value": NonNullable<Json>
                  }
                  Update: {
                    "key"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"subjects": {
                  Row: {
                    "id": string,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string,"sort"?: number
                  }
                  Update: {
                    "id"?: string,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"sxs_characters": {
                  Row: {
                    "created_at": string,"data": NonNullable<Json>,"id": string,"last_opened_at": string,"name": string,"server_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"last_opened_at"?: string,"name": string,"server_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"last_opened_at"?: string,"name"?: string,"server_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sxs_characters_server_id_fkey"
      columns: ["server_id"]
isOneToOne: false
      referencedRelation: "sxs_servers"
      referencedColumns: ["id"]
    }
                  ]
                },"sxs_servers": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"opened_on": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"opened_on": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"opened_on"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"topics": {
                  Row: {
                    "grade_id": string,"id": string,"name": string,"subject_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "grade_id": string,"id"?: string,"name": string,"subject_id": string
                  }
                  Update: {
                    "grade_id"?: string,"id"?: string,"name"?: string,"subject_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "topics_grade_id_fkey"
      columns: ["grade_id"]
isOneToOne: false
      referencedRelation: "grades"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "topics_subject_id_fkey"
      columns: ["subject_id"]
isOneToOne: false
      referencedRelation: "subjects"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "has_permission":
{ Args: { "p": string }; Returns: boolean
                           },
"is_super_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"kid_in_my_family":
{ Args: { "kid": string }; Returns: boolean
                           },
"my_family_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           }
          }
          Enums: {
            "assignment_status": "assigned"|"submitted"|"reviewed","question_lang": "vi"|"en"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "assignment_status": ["assigned", "submitted", "reviewed"],"question_lang": ["vi", "en"]
          }
        }
} as const
