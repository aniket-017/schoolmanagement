import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Modal, TextInput } from "react-native";
import {
  List,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
  Text,
  Switch,
  Divider,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function AnnouncementManagement({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    priority: "medium",
    targetAudience: "all",
    targetClasses: [],
    targetIndividuals: [],
    expiryDate: null,
    sendNotification: true,
    isPinned: false,
    scheduledFor: null,
    isScheduled: false,
    status: "draft",
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
    fetchUsers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("/api/announcements");
      setAnnouncements(response.data.data);
      filterAnnouncements(response.data.data, searchQuery, filter);
    } catch (error) {
      showMessage({
        message: "Error fetching announcements",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("/api/classes");
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      filtered = filtered.filter((announcement) => announcement.status === status);
    }

    setFilteredAnnouncements(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAnnouncements(announcements, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterAnnouncements(announcements, searchQuery, value);
  };

  const handleStatusChange = async (announcementId, newStatus) => {
    try {
      await axios.put(`/api/announcements/${announcementId}/status`, {
        status: newStatus,
      });

      showMessage({
        message: "Announcement status updated",
        type: "success",
      });

      fetchAnnouncements();
    } catch (error) {
      showMessage({
        message: "Error updating announcement status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      await axios.put(`/api/announcements/${announcementId}/pin`);

      showMessage({
        message: "Announcement pin status updated",
        type: "success",
      });

      fetchAnnouncements();
    } catch (error) {
      showMessage({
        message: "Error updating announcement pin status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleDelete = async (announcementId) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/api/announcements/${announcementId}`);

              showMessage({
                message: "Announcement deleted successfully",
                type: "success",
              });

              fetchAnnouncements();
            } catch (error) {
              showMessage({
                message: "Error deleting announcement",
                description: error.response?.data?.message || "Please try again later",
                type: "danger",
              });
            }
          },
        },
      ]
    );
  };

  const handleCreateAnnouncement = async () => {
    try {
      // Validate required fields
      if (!createForm.title.trim() || !createForm.content.trim()) {
        showMessage({
          message: "Title and content are required",
          type: "warning",
        });
        return;
      }

      if (createForm.targetAudience === "class" && createForm.targetClasses.length === 0) {
        showMessage({
          message: "Please select at least one class",
          type: "warning",
        });
        return;
      }

      if (createForm.targetAudience === "individual" && createForm.targetIndividuals.length === 0) {
        showMessage({
          message: "Please select at least one individual",
          type: "warning",
        });
        return;
      }

      const response = await axios.post("/api/announcements", createForm);

      showMessage({
        message: "Announcement created successfully",
        type: "success",
      });

      setShowCreateModal(false);
      setCreateForm({
        title: "",
        content: "",
        priority: "medium",
        targetAudience: "all",
        targetClasses: [],
        targetIndividuals: [],
        expiryDate: null,
        sendNotification: true,
        isPinned: false,
        scheduledFor: null,
        isScheduled: false,
        status: "draft",
      });
      fetchAnnouncements();
    } catch (error) {
      showMessage({
        message: "Error creating announcement",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return theme.colors.error;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const AnnouncementCard = ({ announcement }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card
        style={styles.card}
        onPress={() => {
          setSelectedAnnouncement(announcement);
          setIsDialogVisible(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{announcement.title}</Title>
              <View style={styles.chipContainer}>
                <Chip
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        announcement.status === "published" ? theme.colors.success + "20" : theme.colors.error + "20",
                    },
                  ]}
                >
                  {announcement.status}
                </Chip>
                {announcement.isPinned && (
                  <Chip style={[styles.statusChip, { backgroundColor: theme.colors.warning + "20" }]}>
                    Pinned
                  </Chip>
                )}
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getPriorityColor(announcement.priority) + "20" },
                  ]}
                >
                  {announcement.priority}
                </Chip>
              </View>
            </View>
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedAnnouncementId(announcement._id);
                setMenuVisible(true);
              }}
            />
          </View>

          <Paragraph numberOfLines={2} style={styles.content}>
            {announcement.content}
          </Paragraph>

          <View style={styles.cardFooter}>
            <Chip style={styles.chip}>
              {getTargetAudienceLabel(announcement.targetAudience, announcement.targetClasses, announcement.targetIndividuals)}
            </Chip>
            <Paragraph style={styles.date}>
              {format(new Date(announcement.createdAt), "MMM dd, yyyy")}
            </Paragraph>
            <Paragraph style={styles.views}>{announcement.views || 0} views</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

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
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement._id} announcement={announcement} />
        ))}
      </ScrollView>

      {/* Announcement Details Dialog */}
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Announcement Details</Dialog.Title>
          <Dialog.Content>
            {selectedAnnouncement && (
              <>
                <Title>{selectedAnnouncement.title}</Title>
                <Paragraph style={styles.dialogContent}>{selectedAnnouncement.content}</Paragraph>
                <View style={styles.dialogMetadata}>
                  <Chip style={styles.chip}>
                    {getTargetAudienceLabel(selectedAnnouncement.targetAudience, selectedAnnouncement.targetClasses, selectedAnnouncement.targetIndividuals)}
                  </Chip>
                  <Paragraph style={styles.date}>
                    {format(new Date(selectedAnnouncement.createdAt), "MMM dd, yyyy")}
                  </Paragraph>
                  <Paragraph style={styles.views}>{selectedAnnouncement.views || 0} views</Paragraph>
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("EditAnnouncement", {
                  announcementId: selectedAnnouncement._id,
                });
              }}
            >
              Edit
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Action Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedAnnouncementId(null);
          }}
          anchor={<View />}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedAnnouncementId, "published");
            }}
            title="Publish"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedAnnouncementId, "draft");
            }}
            title="Mark as Draft"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleTogglePin(selectedAnnouncementId);
            }}
            title="Toggle Pin"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedAnnouncementId, "archived");
            }}
            title="Archive"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleDelete(selectedAnnouncementId);
            }}
            title="Delete"
            titleStyle={{ color: theme.colors.error }}
          />
        </Menu>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowCreateModal(true)} />

      {/* Create Announcement Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Announcement</Text>
            <IconButton icon="close" onPress={() => setShowCreateModal(false)} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Title"
              value={createForm.title}
              onChangeText={(text) => setCreateForm({ ...createForm, title: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Content"
              value={createForm.content}
              onChangeText={(text) => setCreateForm({ ...createForm, content: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.sectionTitle}>Priority</Text>
            <SegmentedButtons
              value={createForm.priority}
              onValueChange={(value) => setCreateForm({ ...createForm, priority: value })}
              buttons={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              style={styles.segmentedButtons}
            />

            <Text style={styles.sectionTitle}>Target Audience</Text>
            <SegmentedButtons
              value={createForm.targetAudience}
              onValueChange={(value) => setCreateForm({ ...createForm, targetAudience: value })}
              buttons={[
                { value: "all", label: "All" },
                { value: "students", label: "Students" },
                { value: "teachers", label: "Teachers" },
                { value: "class", label: "Class" },
                { value: "individual", label: "Individual" },
              ]}
              style={styles.segmentedButtons}
            />

            <Divider style={styles.divider} />

            <View style={styles.switchContainer}>
              <Text>Send Notification</Text>
              <Switch
                value={createForm.sendNotification}
                onValueChange={(value) => setCreateForm({ ...createForm, sendNotification: value })}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text>Pin Announcement</Text>
              <Switch
                value={createForm.isPinned}
                onValueChange={(value) => setCreateForm({ ...createForm, isPinned: value })}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text>Schedule for Later</Text>
              <Switch
                value={createForm.isScheduled}
                onValueChange={(value) => setCreateForm({ ...createForm, isScheduled: value })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button mode="outlined" onPress={() => setShowCreateModal(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreateAnnouncement} style={styles.modalButton}>
              Create
            </Button>
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
  statusChip: {
    height: 24,
  },
  content: {
    marginBottom: 12,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chip: {
    height: 24,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  views: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dialogContent: {
    marginVertical: 16,
  },
  dialogMetadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
