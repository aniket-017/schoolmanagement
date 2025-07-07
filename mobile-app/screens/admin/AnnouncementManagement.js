import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
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
  TextInput,
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";

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

  useEffect(() => {
    fetchAnnouncements();
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

  const handleDelete = async (announcementId) => {
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
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      announcement.status === "active" ? theme.colors.success + "20" : theme.colors.error + "20",
                  },
                ]}
              >
                {announcement.status}
              </Chip>
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

          <View style={styles.metadata}>
            <Chip style={styles.chip}>{announcement.targetAudience}</Chip>
            <Paragraph style={styles.date}>{format(new Date(announcement.createdAt), "MMM dd, yyyy")}</Paragraph>
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
            { value: "active", label: "Active" },
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

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Announcement Details</Dialog.Title>
          <Dialog.Content>
            {selectedAnnouncement && (
              <>
                <Title>{selectedAnnouncement.title}</Title>
                <Paragraph style={styles.dialogContent}>{selectedAnnouncement.content}</Paragraph>
                <View style={styles.dialogMetadata}>
                  <Chip style={styles.chip}>{selectedAnnouncement.targetAudience}</Chip>
                  <Paragraph style={styles.date}>
                    {format(new Date(selectedAnnouncement.createdAt), "MMM dd, yyyy")}
                  </Paragraph>
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
              handleStatusChange(selectedAnnouncementId, "active");
            }}
            title="Mark as Active"
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

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("CreateAnnouncement")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    ...theme.typography.subtitle1,
    marginRight: theme.spacing.sm,
    flex: 1,
  },
  content: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  statusChip: {
    marginRight: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.primaryLight,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  dialogContent: {
    marginVertical: theme.spacing.md,
  },
  dialogMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
