import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  IconButton,
  Searchbar,
  SegmentedButtons,
  Text,
  Badge,
  Button,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";

export default function AnnouncementsScreen({ navigation }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch all announcements targeted to teachers
      const response = await apiService.announcements.getTeacherAnnouncements({ activeOnly: true });
      let all = response.data || [];
      // Fetch announcements created by this teacher (if not already included)
      const mineResponse = await apiService.announcements.getAnnouncementsForUser(user._id, { activeOnly: true });
      let mine = mineResponse.data || [];
      // Merge and deduplicate by _id
      const allMap = new Map();
      all.concat(mine).forEach(a => allMap.set(a._id, a));
      const merged = Array.from(allMap.values());
      setAnnouncements(merged);
      filterAnnouncements(merged, searchQuery, filter);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showMessage({
        message: "Error fetching announcements",
        description: "Please try again later",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAnnouncements = (announcementList, query, status) => {
    let filtered = announcementList;

    if (query) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(query.toLowerCase()) ||
          announcement.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      if (status === "pinned") {
        filtered = filtered.filter((announcement) => announcement.isPinned);
      } else if (status === "urgent") {
        filtered = filtered.filter((announcement) => announcement.priority === "high" || announcement.priority === "urgent");
      }
    }

    setFilteredAnnouncements(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAnnouncements(announcements, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterAnnouncements(announcements, searchQuery, value);
  };

  const handleAnnouncementPress = async (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetails(true);

    // Mark as read
    try {
      await apiService.announcements.markAsRead(announcement._id, user.id);
      // Update local state to reflect the read status
      setAnnouncements(prev =>
        prev.map(ann =>
          ann._id === announcement._id
            ? { ...ann, views: (ann.views || 0) + 1 }
            : ann
        )
      );
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "alert-circle";
      case "medium":
        return "information-circle";
      case "low":
        return "checkmark-circle";
      default:
        return "information-circle";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return theme.colors.error;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const getTargetAudienceLabel = (audience, targetClasses, targetIndividuals) => {
    switch (audience) {
      case "all":
        return "All Users";
      case "students":
        return "Students";
      case "teachers":
        return "Teachers";
      case "staff":
        return "Staff";
      case "class":
        return `Classes (${targetClasses?.length || 0})`;
      case "individual":
        return `Individuals (${targetIndividuals?.length || 0})`;
      default:
        return audience;
    }
  };

  const AnnouncementCard = ({ announcement }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <TouchableOpacity onPress={() => handleAnnouncementPress(announcement)}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Title style={styles.title}>{announcement.title}</Title>
                <View style={styles.chipContainer}>
                  {announcement.isPinned && (
                    <Chip style={[styles.chip, { backgroundColor: theme.colors.warning + "20" }]}>
                      Pinned
                    </Chip>
                  )}
                  <Chip
                    style={[
                      styles.chip,
                      { backgroundColor: getPriorityColor(announcement.priority) + "20" },
                    ]}
                  >
                    {announcement.priority}
                  </Chip>
                </View>
              </View>
              <Ionicons
                name={getPriorityIcon(announcement.priority)}
                size={24}
                color={getPriorityColor(announcement.priority)}
              />
            </View>

            <Paragraph numberOfLines={3} style={styles.content}>
              {announcement.content}
            </Paragraph>

            <View style={styles.cardFooter}>
              <Chip style={styles.audienceChip}>
                {getTargetAudienceLabel(announcement.targetAudience, announcement.targetClasses, announcement.targetIndividuals)}
              </Chip>
              <Text style={styles.date}>
                {format(new Date(announcement.createdAt), "MMM dd, yyyy")}
              </Text>
              <Text style={styles.views}>{announcement.views || 0} views</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading announcements...</Text>
      </View>
    );
  }

  // Edit handler
  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditForm({ title: announcement.title, content: announcement.content });
    setShowEditModal(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }
    setEditLoading(true);
    try {
      const payload = {
        title: editForm.title,
        content: editForm.content,
        status: 'published',
      };
      const response = await apiService.announcements.updateAnnouncement(editingAnnouncement._id, payload);
      if (response.success) {
        setShowEditModal(false);
        setEditingAnnouncement(null);
        fetchAnnouncements();
        Alert.alert('Success', 'Announcement updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update announcement');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update announcement');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const response = await apiService.announcements.deleteAnnouncement(id);
            if (response.success) {
              fetchAnnouncements();
              setShowDetails(false);
              Alert.alert('Deleted', 'Announcement deleted successfully!');
            } else {
              Alert.alert('Error', response.message || 'Failed to delete announcement');
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete announcement');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search announcements..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={handleFilterChange}
          buttons={[
            { value: "all", label: "All" },
            { value: "pinned", label: "Pinned" },
            { value: "urgent", label: "Urgent" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: !showMineOnly ? '#1976d2' : '#eee',
            padding: 10,
            borderRadius: 6,
            marginRight: 8,
          }}
          onPress={() => setShowMineOnly(false)}
        >
          <Text style={{ color: !showMineOnly ? '#fff' : '#1976d2', fontWeight: 'bold' }}>All Announcements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: showMineOnly ? '#1976d2' : '#eee',
            padding: 10,
            borderRadius: 6,
          }}
          onPress={() => setShowMineOnly(true)}
        >
          <Text style={{ color: showMineOnly ? '#fff' : '#1976d2', fontWeight: 'bold' }}>My Announcements</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredAnnouncements.length > 0 ? (
          (showMineOnly
            ? filteredAnnouncements.filter(a => a.createdBy && user && a.createdBy._id === user._id)
            : filteredAnnouncements.filter(a =>
                (a.targetAudience === 'teachers' || a.targetAudience === 'all') ||
                (a.createdBy && user && a.createdBy._id === user._id)
              )
          ).map((announcement) => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No announcements found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === "all"
                ? "You don't have any announcements yet."
                : `No ${filter} announcements available.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Announcement Button - Fixed at bottom */}
      <View style={styles.createButtonBottom}>
        <Button 
          mode="contained" 
          onPress={() => {
            // For now, just show an alert. You can replace this with navigation to create screen
            Alert.alert('Create Announcement', 'This will open the create announcement form');
          }}
          style={styles.createButton}
          icon="plus"
        >
          Create Announcement
        </Button>
      </View>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Announcement Details</Text>
              <IconButton icon="close" onPress={() => setShowDetails(false)} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Title style={styles.modalAnnouncementTitle}>{selectedAnnouncement.title}</Title>
              
              <View style={styles.modalChipContainer}>
                {selectedAnnouncement.isPinned && (
                  <Chip style={[styles.chip, { backgroundColor: theme.colors.warning + "20" }]}>
                    Pinned
                  </Chip>
                )}
                <Chip
                  style={[
                    styles.chip,
                    { backgroundColor: getPriorityColor(selectedAnnouncement.priority) + "20" },
                  ]}
                >
                  {selectedAnnouncement.priority}
                </Chip>
                <Chip style={styles.audienceChip}>
                  {getTargetAudienceLabel(selectedAnnouncement.targetAudience, selectedAnnouncement.targetClasses, selectedAnnouncement.targetIndividuals)}
                </Chip>
              </View>

              <Paragraph style={styles.modalContent}>{selectedAnnouncement.content}</Paragraph>

              <View style={styles.modalMetadata}>
                <View style={styles.metadataItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metadataText}>
                    {format(new Date(selectedAnnouncement.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </Text>
                </View>
                
                <View style={styles.metadataItem}>
                  <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metadataText}>{selectedAnnouncement.views || 0} views</Text>
                </View>

                <View style={styles.metadataItem}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metadataText}>
                    by {selectedAnnouncement.createdBy?.name || "Unknown"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button mode="contained" onPress={() => setShowDetails(false)}>
                Close
              </Button>
              {selectedAnnouncement && user && selectedAnnouncement.createdBy && selectedAnnouncement.createdBy._id === user._id && (
                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  <Button mode="outlined" onPress={() => { handleEditAnnouncement(selectedAnnouncement); setShowDetails(false); }} style={{ marginRight: 8 }}>Edit</Button>
                  <Button mode="outlined" color="red" onPress={() => handleDeleteAnnouncement(selectedAnnouncement._id)}>Delete</Button>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Edit Announcement Modal */}
      {showEditModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Announcement</Text>
              <IconButton icon="close" onPress={() => setShowEditModal(false)} />
            </View>
            <ScrollView style={styles.modalContent}>
              <TextInput
                placeholder="Title"
                value={editForm.title}
                onChangeText={text => setEditForm({ ...editForm, title: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Content"
                value={editForm.content}
                onChangeText={text => setEditForm({ ...editForm, content: text })}
                style={[styles.input, { height: 80 }]}
                multiline
              />
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button mode="contained" onPress={handleUpdateAnnouncement} loading={editLoading} disabled={editLoading}>
                Update
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterButtons: {
    marginBottom: 8,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    height: 24,
  },
  audienceChip: {
    height: 24,
    backgroundColor: theme.colors.primary + "20",
  },
  content: {
    marginBottom: 12,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  views: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalAnnouncementTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  modalChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  modalMetadata: {
    marginTop: 24,
    gap: 8,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  input: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  createButtonContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  createButtonBottom: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  createButton: {
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 