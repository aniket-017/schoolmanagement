import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { Card, Title, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.announcements.getAnnouncementsForStudent(user._id || user.id, { activeOnly: true });
      setAnnouncements(response.data || []);
    } catch (error) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading announcements...</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No announcements found</Text>
          </View>
        ) : (
          announcements.map((announcement) => (
            <TouchableOpacity
              key={announcement._id}
              onPress={() => {
                setSelectedAnnouncement(announcement);
                setShowAnnouncementModal(true);
              }}
              activeOpacity={0.8}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>{announcement.title}</Title>
                  <Text style={styles.content} numberOfLines={3}>{announcement.content}</Text>
                  <Text style={styles.date}>{announcement.createdAt ? format(new Date(announcement.createdAt), "MMM dd, yyyy") : ""}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {/* Announcement Details Modal */}
      <Modal
        visible={showAnnouncementModal && !!selectedAnnouncement}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnnouncementModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{selectedAnnouncement?.title}</Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>{selectedAnnouncement?.content}</Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>{selectedAnnouncement?.createdAt ? format(new Date(selectedAnnouncement.createdAt), "MMM dd, yyyy") : ''}</Text>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 20 }}
              onPress={() => setShowAnnouncementModal(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
}); 