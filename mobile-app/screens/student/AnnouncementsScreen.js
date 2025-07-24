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
              <View style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementSnippet} numberOfLines={2}>{announcement.content}</Text>
                <View style={styles.announcementMetaRow}>
                  <Text style={styles.announcementMeta}>{announcement.createdBy?.name ? `By ${announcement.createdBy.name}` : 'By Class Teacher'}</Text>
                  <Text style={styles.announcementMeta}>{announcement.createdAt ? format(new Date(announcement.createdAt), "MMM dd, yyyy") : ""}</Text>
                </View>
                <View style={styles.announcementSourceRow}>
                  <Text style={styles.announcementSource}>
                    {announcement.targetAudience === 'all' ? 'For All Students' :
                     announcement.targetAudience === 'class' ? `For Class ${announcement.targetClasses?.[0]?.name || announcement.targetClasses?.[0]?.grade + announcement.targetClasses?.[0]?.division || 'Unknown'}` :
                     announcement.targetAudience === 'individual' ? 'For Specific Students' :
                     `For ${announcement.targetAudience || 'Students'}`}
                  </Text>
                </View>
              </View>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // New announcement card styles matching teacher design
  announcementCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#212121',
  },
  announcementSnippet: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  announcementMeta: {
    fontSize: 12,
    color: '#888',
  },
  announcementSourceRow: {
    marginTop: 4,
  },
  announcementSource: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
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
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#212121",
  },
}); 