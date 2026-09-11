export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accessibility_scores: {
        Row: {
          calculated_at: string
          id: string
          infrastructure_score: number | null
          overall_score: number | null
          road_accessibility: number | null
          route_id: string
          transport_accessibility: number | null
          weather_accessibility: number | null
        }
        Insert: {
          calculated_at?: string
          id?: string
          infrastructure_score?: number | null
          overall_score?: number | null
          road_accessibility?: number | null
          route_id: string
          transport_accessibility?: number | null
          weather_accessibility?: number | null
        }
        Update: {
          calculated_at?: string
          id?: string
          infrastructure_score?: number | null
          overall_score?: number | null
          road_accessibility?: number | null
          route_id?: string
          transport_accessibility?: number | null
          weather_accessibility?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accessibility_scores_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_text: string | null
          alert_ref: string | null
          created_at: string
          description: string | null
          disaster_id: string | null
          distance_text: string | null
          district: string | null
          id: string
          incident_id: string | null
          location_id: string | null
          location_text: string | null
          route_id: string | null
          severity: Database["public"]["Enums"]["priority_enum"]
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["alert_status_enum"]
          target_role: Database["public"]["Enums"]["user_role_enum"] | null
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_text?: string | null
          alert_ref?: string | null
          created_at?: string
          description?: string | null
          disaster_id?: string | null
          distance_text?: string | null
          district?: string | null
          id?: string
          incident_id?: string | null
          location_id?: string | null
          location_text?: string | null
          route_id?: string | null
          severity: Database["public"]["Enums"]["priority_enum"]
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["alert_status_enum"]
          target_role?: Database["public"]["Enums"]["user_role_enum"] | null
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_text?: string | null
          alert_ref?: string | null
          created_at?: string
          description?: string | null
          disaster_id?: string | null
          distance_text?: string | null
          district?: string | null
          id?: string
          incident_id?: string | null
          location_id?: string | null
          location_text?: string | null
          route_id?: string | null
          severity?: Database["public"]["Enums"]["priority_enum"]
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["alert_status_enum"]
          target_role?: Database["public"]["Enums"]["user_role_enum"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disaster_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "road_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_ingestion_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          records_in: number | null
          records_out: number | null
          source_id: string | null
          source_name: string | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          records_in?: number | null
          records_out?: number | null
          source_id?: string | null
          source_name?: string | null
          started_at: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          records_in?: number | null
          records_out?: number | null
          source_id?: string | null
          source_name?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_ingestion_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          provider: string | null
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          provider?: string | null
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          provider?: string | null
          type?: string
        }
        Relationships: []
      }
      disaster_events: {
        Row: {
          created_at: string
          description: string | null
          district: string | null
          ended_at: string | null
          geometry: unknown
          id: string
          location_id: string | null
          probability: number | null
          route_id: string | null
          severity: number | null
          source: string | null
          source_event_id: string | null
          started_at: string | null
          state: string | null
          title: string | null
          type: Database["public"]["Enums"]["disaster_type_enum"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          district?: string | null
          ended_at?: string | null
          geometry?: unknown
          id?: string
          location_id?: string | null
          probability?: number | null
          route_id?: string | null
          severity?: number | null
          source?: string | null
          source_event_id?: string | null
          started_at?: string | null
          state?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["disaster_type_enum"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          district?: string | null
          ended_at?: string | null
          geometry?: unknown
          id?: string
          location_id?: string | null
          probability?: number | null
          route_id?: string | null
          severity?: number | null
          source?: string | null
          source_event_id?: string | null
          started_at?: string | null
          state?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["disaster_type_enum"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "disaster_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disaster_events_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          district: string | null
          elevation: number | null
          id: string
          latitude: number | null
          location: unknown
          location_type: string | null
          longitude: number | null
          name: string
          population: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          elevation?: number | null
          id?: string
          latitude?: number | null
          location?: unknown
          location_type?: string | null
          longitude?: number | null
          name: string
          population?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          elevation?: number | null
          id?: string
          latitude?: number | null
          location?: unknown
          location_type?: string | null
          longitude?: number | null
          name?: string
          population?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      logistics_requests: {
        Row: {
          cargo_description: string | null
          cargo_type: string | null
          cargo_weight_kg: number | null
          created_at: string
          destination_location_id: string | null
          id: string
          notes: string | null
          preferred_transport_id: string | null
          priority: Database["public"]["Enums"]["priority_enum"]
          required_by: string | null
          source_location_id: string | null
          status: Database["public"]["Enums"]["logistics_status_enum"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cargo_description?: string | null
          cargo_type?: string | null
          cargo_weight_kg?: number | null
          created_at?: string
          destination_location_id?: string | null
          id?: string
          notes?: string | null
          preferred_transport_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"]
          required_by?: string | null
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["logistics_status_enum"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cargo_description?: string | null
          cargo_type?: string | null
          cargo_weight_kg?: number | null
          created_at?: string
          destination_location_id?: string | null
          id?: string
          notes?: string | null
          preferred_transport_id?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"]
          required_by?: string | null
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["logistics_status_enum"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_requests_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_requests_preferred_transport_id_fkey"
            columns: ["preferred_transport_id"]
            isOneToOne: false
            referencedRelation: "transport_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_requests_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy: number | null
          created_at: string
          f1_score: number | null
          id: string
          model_type: string | null
          model_uri: string | null
          name: string
          precision_score: number | null
          recall_score: number | null
          status: Database["public"]["Enums"]["model_status_enum"]
          training_dataset: string | null
          version: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          f1_score?: number | null
          id?: string
          model_type?: string | null
          model_uri?: string | null
          name: string
          precision_score?: number | null
          recall_score?: number | null
          status?: Database["public"]["Enums"]["model_status_enum"]
          training_dataset?: string | null
          version: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          f1_score?: number | null
          id?: string
          model_type?: string | null
          model_uri?: string | null
          name?: string
          precision_score?: number | null
          recall_score?: number | null
          status?: Database["public"]["Enums"]["model_status_enum"]
          training_dataset?: string | null
          version?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_alert_id: string | null
          related_event_id: string | null
          related_route_id: string | null
          severity: Database["public"]["Enums"]["notification_severity_enum"]
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_alert_id?: string | null
          related_event_id?: string | null
          related_route_id?: string | null
          severity?: Database["public"]["Enums"]["notification_severity_enum"]
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_alert_id?: string | null
          related_event_id?: string | null
          related_route_id?: string | null
          severity?: Database["public"]["Enums"]["notification_severity_enum"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_alert_id_fkey"
            columns: ["related_alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "disaster_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_route_id_fkey"
            columns: ["related_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          is_active: boolean
          officer_id: string | null
          organization: string | null
          phone: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          officer_id?: string | null
          organization?: string | null
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          officer_id?: string | null
          organization?: string | null
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      road_incidents: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["incident_type_enum"]
          created_at: string
          description: string | null
          district: string | null
          geometry: unknown
          id: string
          incident_ref: string | null
          location_id: string | null
          media_path: string | null
          reported_by: string | null
          route_id: string | null
          severity: Database["public"]["Enums"]["priority_enum"]
          state: string | null
          status: Database["public"]["Enums"]["incident_status_enum"]
          sync_source: string
          sync_status: Database["public"]["Enums"]["sync_status_enum"]
          title: string | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["incident_type_enum"]
          created_at?: string
          description?: string | null
          district?: string | null
          geometry?: unknown
          id?: string
          incident_ref?: string | null
          location_id?: string | null
          media_path?: string | null
          reported_by?: string | null
          route_id?: string | null
          severity?: Database["public"]["Enums"]["priority_enum"]
          state?: string | null
          status?: Database["public"]["Enums"]["incident_status_enum"]
          sync_source?: string
          sync_status?: Database["public"]["Enums"]["sync_status_enum"]
          title?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["incident_type_enum"]
          created_at?: string
          description?: string | null
          district?: string | null
          geometry?: unknown
          id?: string
          incident_ref?: string | null
          location_id?: string | null
          media_path?: string | null
          reported_by?: string | null
          route_id?: string | null
          severity?: Database["public"]["Enums"]["priority_enum"]
          state?: string | null
          status?: Database["public"]["Enums"]["incident_status_enum"]
          sync_source?: string
          sync_status?: Database["public"]["Enums"]["sync_status_enum"]
          title?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "road_incidents_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "road_incidents_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      roads: {
        Row: {
          accessibility_score: number | null
          condition_score: number | null
          created_at: string
          destination_location_id: string | null
          geometry: unknown
          id: string
          is_active: boolean
          length_km: number | null
          max_speed_kmph: number | null
          road_name: string | null
          road_number: string | null
          road_type: Database["public"]["Enums"]["road_type_enum"] | null
          source_location_id: string | null
          state: string | null
          surface_type: string | null
          updated_at: string
          width_m: number | null
        }
        Insert: {
          accessibility_score?: number | null
          condition_score?: number | null
          created_at?: string
          destination_location_id?: string | null
          geometry?: unknown
          id?: string
          is_active?: boolean
          length_km?: number | null
          max_speed_kmph?: number | null
          road_name?: string | null
          road_number?: string | null
          road_type?: Database["public"]["Enums"]["road_type_enum"] | null
          source_location_id?: string | null
          state?: string | null
          surface_type?: string | null
          updated_at?: string
          width_m?: number | null
        }
        Update: {
          accessibility_score?: number | null
          condition_score?: number | null
          created_at?: string
          destination_location_id?: string | null
          geometry?: unknown
          id?: string
          is_active?: boolean
          length_km?: number | null
          max_speed_kmph?: number | null
          road_name?: string | null
          road_number?: string | null
          road_type?: Database["public"]["Enums"]["road_type_enum"] | null
          source_location_id?: string | null
          state?: string | null
          surface_type?: string | null
          updated_at?: string
          width_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roads_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roads_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      route_predictions: {
        Row: {
          affected_convoys: number | null
          benefit: string | null
          cause: string | null
          confidence: number | null
          created_at: string
          delay_estimate: string | null
          district: string | null
          factors: Json | null
          from_location: string | null
          id: string
          model_version: string | null
          prediction_time: string
          prediction_type: Database["public"]["Enums"]["prediction_type_enum"]
          probability: number | null
          reason: string | null
          recommendation_sub: string | null
          recommendation_text: string | null
          route_id: string | null
          time_window: string | null
          to_location: string | null
        }
        Insert: {
          affected_convoys?: number | null
          benefit?: string | null
          cause?: string | null
          confidence?: number | null
          created_at?: string
          delay_estimate?: string | null
          district?: string | null
          factors?: Json | null
          from_location?: string | null
          id?: string
          model_version?: string | null
          prediction_time?: string
          prediction_type: Database["public"]["Enums"]["prediction_type_enum"]
          probability?: number | null
          reason?: string | null
          recommendation_sub?: string | null
          recommendation_text?: string | null
          route_id?: string | null
          time_window?: string | null
          to_location?: string | null
        }
        Update: {
          affected_convoys?: number | null
          benefit?: string | null
          cause?: string | null
          confidence?: number | null
          created_at?: string
          delay_estimate?: string | null
          district?: string | null
          factors?: Json | null
          from_location?: string | null
          id?: string
          model_version?: string | null
          prediction_time?: string
          prediction_type?: Database["public"]["Enums"]["prediction_type_enum"]
          probability?: number | null
          reason?: string | null
          recommendation_sub?: string | null
          recommendation_text?: string | null
          route_id?: string | null
          time_window?: string | null
          to_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_predictions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_risk_assessments: {
        Row: {
          calculated_at: string
          confidence_score: number | null
          disaster_risk: number | null
          flood_risk: number | null
          id: string
          landslide_risk: number | null
          model_version: string | null
          road_condition_risk: number | null
          route_id: string
          total_risk_score: number | null
          traffic_risk: number | null
          weather_risk: number | null
        }
        Insert: {
          calculated_at?: string
          confidence_score?: number | null
          disaster_risk?: number | null
          flood_risk?: number | null
          id?: string
          landslide_risk?: number | null
          model_version?: string | null
          road_condition_risk?: number | null
          route_id: string
          total_risk_score?: number | null
          traffic_risk?: number | null
          weather_risk?: number | null
        }
        Update: {
          calculated_at?: string
          confidence_score?: number | null
          disaster_risk?: number | null
          flood_risk?: number | null
          id?: string
          landslide_risk?: number | null
          model_version?: string | null
          road_condition_risk?: number | null
          route_id?: string
          total_risk_score?: number | null
          traffic_risk?: number | null
          weather_risk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_risk_assessments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_segments: {
        Row: {
          condition_score: number | null
          distance_km: number | null
          id: string
          risk_score: number | null
          road_id: string | null
          route_id: string
          sequence_number: number
          status: Database["public"]["Enums"]["segment_status_enum"]
          travel_time_minutes: number | null
        }
        Insert: {
          condition_score?: number | null
          distance_km?: number | null
          id?: string
          risk_score?: number | null
          road_id?: string | null
          route_id: string
          sequence_number: number
          status?: Database["public"]["Enums"]["segment_status_enum"]
          travel_time_minutes?: number | null
        }
        Update: {
          condition_score?: number | null
          distance_km?: number | null
          id?: string
          risk_score?: number | null
          road_id?: string | null
          route_id?: string
          sequence_number?: number
          status?: Database["public"]["Enums"]["segment_status_enum"]
          travel_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_segments_road_id_fkey"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "roads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_segments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          accessibility_score: number | null
          created_at: string
          current_delay: string | null
          current_eta: string | null
          destination_location_id: string | null
          distance_km: number | null
          district: string | null
          estimated_time_minutes: number | null
          geometry: unknown
          id: string
          name: string | null
          reliability_score: number | null
          risk_score: number | null
          route_number: string | null
          route_status: Database["public"]["Enums"]["route_status_enum"]
          source_location_id: string | null
          state: string | null
          updated_at: string
          weather_summary: string | null
        }
        Insert: {
          accessibility_score?: number | null
          created_at?: string
          current_delay?: string | null
          current_eta?: string | null
          destination_location_id?: string | null
          distance_km?: number | null
          district?: string | null
          estimated_time_minutes?: number | null
          geometry?: unknown
          id?: string
          name?: string | null
          reliability_score?: number | null
          risk_score?: number | null
          route_number?: string | null
          route_status?: Database["public"]["Enums"]["route_status_enum"]
          source_location_id?: string | null
          state?: string | null
          updated_at?: string
          weather_summary?: string | null
        }
        Update: {
          accessibility_score?: number | null
          created_at?: string
          current_delay?: string | null
          current_eta?: string | null
          destination_location_id?: string | null
          distance_km?: number | null
          district?: string | null
          estimated_time_minutes?: number | null
          geometry?: unknown
          id?: string
          name?: string | null
          reliability_score?: number | null
          risk_score?: number | null
          route_number?: string | null
          route_status?: Database["public"]["Enums"]["route_status_enum"]
          source_location_id?: string | null
          state?: string | null
          updated_at?: string
          weather_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_arrival: string | null
          cargo_description: string | null
          cargo_weight_kg: number | null
          created_at: string
          current_location: unknown
          current_location_text: string | null
          delay_description: string | null
          departure_time: string | null
          dest_location_id: string | null
          estimated_arrival: string | null
          id: string
          origin_location_id: string | null
          request_id: string | null
          risk_level: Database["public"]["Enums"]["priority_enum"] | null
          route_id: string | null
          shipment_number: string
          status: Database["public"]["Enums"]["shipment_status_enum"]
          transport_mode_id: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_arrival?: string | null
          cargo_description?: string | null
          cargo_weight_kg?: number | null
          created_at?: string
          current_location?: unknown
          current_location_text?: string | null
          delay_description?: string | null
          departure_time?: string | null
          dest_location_id?: string | null
          estimated_arrival?: string | null
          id?: string
          origin_location_id?: string | null
          request_id?: string | null
          risk_level?: Database["public"]["Enums"]["priority_enum"] | null
          route_id?: string | null
          shipment_number: string
          status?: Database["public"]["Enums"]["shipment_status_enum"]
          transport_mode_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_arrival?: string | null
          cargo_description?: string | null
          cargo_weight_kg?: number | null
          created_at?: string
          current_location?: unknown
          current_location_text?: string | null
          delay_description?: string | null
          departure_time?: string | null
          dest_location_id?: string | null
          estimated_arrival?: string | null
          id?: string
          origin_location_id?: string | null
          request_id?: string | null
          risk_level?: Database["public"]["Enums"]["priority_enum"] | null
          route_id?: string | null
          shipment_number?: string
          status?: Database["public"]["Enums"]["shipment_status_enum"]
          transport_mode_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_dest_location_id_fkey"
            columns: ["dest_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "logistics_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_transport_mode_id_fkey"
            columns: ["transport_mode_id"]
            isOneToOne: false
            referencedRelation: "transport_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accepted_at: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          district: string | null
          id: string
          incident_id: string | null
          location_id: string | null
          location_text: string | null
          priority: Database["public"]["Enums"]["priority_enum"]
          route_id: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["task_status_enum"]
          task_ref: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          district?: string | null
          id?: string
          incident_id?: string | null
          location_id?: string | null
          location_text?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"]
          route_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["task_status_enum"]
          task_ref?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          district?: string | null
          id?: string
          incident_id?: string | null
          location_id?: string | null
          location_text?: string | null
          priority?: Database["public"]["Enums"]["priority_enum"]
          route_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["task_status_enum"]
          task_ref?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "road_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_modes: {
        Row: {
          capacity_kg: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          capacity_kg?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          capacity_kg?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          district_id: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string
          humidity_percent: number | null
          id: string
          location_id: string | null
          pressure_hpa: number | null
          rainfall_mm: number | null
          raw_data: Json | null
          recorded_at: string
          source: string | null
          temperature_c: number | null
          visibility_km: number | null
          weather_condition: string | null
          wind_speed_kmph: number | null
        }
        Insert: {
          created_at?: string
          humidity_percent?: number | null
          id?: string
          location_id?: string | null
          pressure_hpa?: number | null
          rainfall_mm?: number | null
          raw_data?: Json | null
          recorded_at: string
          source?: string | null
          temperature_c?: number | null
          visibility_km?: number | null
          weather_condition?: string | null
          wind_speed_kmph?: number | null
        }
        Update: {
          created_at?: string
          humidity_percent?: number | null
          id?: string
          location_id?: string | null
          pressure_hpa?: number | null
          rainfall_mm?: number | null
          raw_data?: Json | null
          recorded_at?: string
          source?: string | null
          temperature_c?: number | null
          visibility_km?: number | null
          weather_condition?: string | null
          wind_speed_kmph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { p_destination: unknown; p_origin: unknown }
        Returns: number
      }
      find_nearby_locations: {
        Args: { p_point: unknown; p_radius_m?: number }
        Returns: {
          distance_m: number
          district: string
          id: string
          latitude: number
          longitude: number
          name: string
          state: string
        }[]
      }
      find_nearby_roads: {
        Args: { p_point: unknown; p_radius_m?: number }
        Returns: {
          accessibility_score: number
          condition_score: number
          distance_m: number
          id: string
          is_active: boolean
          road_name: string
          road_number: string
        }[]
      }
      get_active_disasters: {
        Args: { p_point: unknown; p_radius_m?: number }
        Returns: {
          distance_m: number
          district: string
          id: string
          probability: number
          severity: number
          started_at: string
          state: string
          title: string
          type: Database["public"]["Enums"]["disaster_type_enum"]
        }[]
      }
      get_route_segments: {
        Args: { p_route_id: string }
        Returns: {
          condition_score: number
          distance_km: number
          risk_score: number
          road_id: string
          road_name: string
          road_number: string
          segment_id: string
          sequence_number: number
          status: Database["public"]["Enums"]["segment_status_enum"]
          travel_time_minutes: number
        }[]
      }
      get_route_with_risk: {
        Args: { p_route_id: string }
        Returns: {
          accessibility_score: number
          assessed_at: string
          confidence_score: number
          distance_km: number
          flood_risk: number
          landslide_risk: number
          model_version: string
          name: string
          reliability_score: number
          route_id: string
          route_number: string
          route_status: Database["public"]["Enums"]["route_status_enum"]
          total_risk_score: number
          weather_risk: number
        }[]
      }
      has_role: {
        Args: { p_role: Database["public"]["Enums"]["user_role_enum"] }
        Returns: boolean
      }
      is_active_user: { Args: never; Returns: boolean }
      my_district_id: { Args: never; Returns: string }
      my_district_name: { Args: never; Returns: string }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role_enum"]
      }
      validate_ner_point: { Args: { p_point: unknown }; Returns: boolean }
    }
    Enums: {
      alert_status_enum: "active" | "acknowledged" | "resolved"
      disaster_type_enum:
        | "flood"
        | "flash_flood"
        | "landslide"
        | "earthquake"
        | "cyclone"
        | "drought"
        | "bridge_damage"
        | "road_blockage"
        | "infrastructure_damage"
        | "other"
      incident_status_enum: "pending" | "active" | "escalated" | "resolved"
      incident_type_enum:
        | "road_block"
        | "flood"
        | "landslide"
        | "bridge_damage"
        | "vehicle_breakdown"
        | "accident"
        | "infrastructure_damage"
        | "other"
      logistics_status_enum:
        | "draft"
        | "submitted"
        | "approved"
        | "assigned"
        | "in_transit"
        | "delivered"
        | "cancelled"
      model_status_enum: "training" | "active" | "deprecated" | "failed"
      notification_severity_enum: "critical" | "high" | "medium" | "info"
      notification_type_enum:
        | "alert"
        | "task"
        | "incident"
        | "route"
        | "system"
        | "logistics"
      prediction_type_enum:
        | "disruption"
        | "delay"
        | "route_recommendation"
        | "resource"
      priority_enum:
        | "critical"
        | "high"
        | "moderate"
        | "medium"
        | "low"
        | "info"
      road_type_enum:
        | "national_highway"
        | "state_highway"
        | "district_road"
        | "village_road"
        | "mountain_pass"
        | "bridge"
      route_status_enum: "open" | "restricted" | "blocked" | "closed"
      segment_status_enum: "clear" | "caution" | "blocked" | "closed"
      severity_enum: "critical" | "high" | "medium" | "low"
      shipment_status_enum:
        | "scheduled"
        | "departed"
        | "in_transit"
        | "delayed"
        | "at_risk"
        | "stopped"
        | "arrived"
        | "cancelled"
      sync_status_enum: "pending" | "synced" | "failed"
      task_status_enum:
        | "new"
        | "pending"
        | "in_progress"
        | "completed"
        | "escalated"
        | "overdue"
      user_role_enum: "field_officer" | "district_officer" | "control_room"
      vehicle_status_enum:
        | "moving"
        | "stopped"
        | "delayed"
        | "at_risk"
        | "on_time"
        | "arrived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      alert_status_enum: ["active", "acknowledged", "resolved"],
      disaster_type_enum: [
        "flood",
        "flash_flood",
        "landslide",
        "earthquake",
        "cyclone",
        "drought",
        "bridge_damage",
        "road_blockage",
        "infrastructure_damage",
        "other",
      ],
      incident_status_enum: ["pending", "active", "escalated", "resolved"],
      incident_type_enum: [
        "road_block",
        "flood",
        "landslide",
        "bridge_damage",
        "vehicle_breakdown",
        "accident",
        "infrastructure_damage",
        "other",
      ],
      logistics_status_enum: [
        "draft",
        "submitted",
        "approved",
        "assigned",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      model_status_enum: ["training", "active", "deprecated", "failed"],
      notification_severity_enum: ["critical", "high", "medium", "info"],
      notification_type_enum: [
        "alert",
        "task",
        "incident",
        "route",
        "system",
        "logistics",
      ],
      prediction_type_enum: [
        "disruption",
        "delay",
        "route_recommendation",
        "resource",
      ],
      priority_enum: ["critical", "high", "moderate", "medium", "low", "info"],
      road_type_enum: [
        "national_highway",
        "state_highway",
        "district_road",
        "village_road",
        "mountain_pass",
        "bridge",
      ],
      route_status_enum: ["open", "restricted", "blocked", "closed"],
      segment_status_enum: ["clear", "caution", "blocked", "closed"],
      severity_enum: ["critical", "high", "medium", "low"],
      shipment_status_enum: [
        "scheduled",
        "departed",
        "in_transit",
        "delayed",
        "at_risk",
        "stopped",
        "arrived",
        "cancelled",
      ],
      sync_status_enum: ["pending", "synced", "failed"],
      task_status_enum: [
        "new",
        "pending",
        "in_progress",
        "completed",
        "escalated",
        "overdue",
      ],
      user_role_enum: ["field_officer", "district_officer", "control_room"],
      vehicle_status_enum: [
        "moving",
        "stopped",
        "delayed",
        "at_risk",
        "on_time",
        "arrived",
      ],
    },
  },
} as const

// Compatibility aliases for existing UI modules. Keep these aliases while
// components migrate to the generated Tables<T> helper types.
export type Profile = Tables<"profiles">
export type Alert = Tables<"alerts">
export type Task = Tables<"tasks">
export type UserRoleEnum = Enums<"user_role_enum">

