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
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
  Text,
  Avatar,
  DataTable,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function TransportManagement({ navigation }) {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get("/api/transport/routes");
      setRoutes(response.data.data);
      filterRoutes(response.data.data, searchQuery, filter);
    } catch (error) {
      showMessage({
        message: "Error fetching routes",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterRoutes = (routeList, query, status) => {
    let filtered = routeList;

    if (query) {
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(query.toLowerCase()) ||
          route.driver.name.toLowerCase().includes(query.toLowerCase()) ||
          route.vehicleNumber.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((route) => route.status === status);
    }

    setFilteredRoutes(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterRoutes(routes, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterRoutes(routes, searchQuery, value);
  };

  const handleStatusChange = async (routeId, newStatus) => {
    try {
      await axios.put(`/api/transport/routes/${routeId}/status`, {
        status: newStatus,
      });

      showMessage({
        message: "Route status updated",
        type: "success",
      });

      fetchRoutes();
    } catch (error) {
      showMessage({
        message: "Error updating route status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return theme.colors.success;
      case "inactive":
        return theme.colors.error;
      case "maintenance":
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const RouteCard = ({ route }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card
        style={styles.card}
        onPress={() => {
          setSelectedRoute(route);
          setIsDialogVisible(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Avatar.Icon
                size={40}
                icon="bus"
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  marginRight: theme.spacing.sm,
                }}
              />
              <View style={styles.routeInfo}>
                <Title style={styles.title}>{route.name}</Title>
                <Paragraph style={styles.vehicleNumber}>{route.vehicleNumber}</Paragraph>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(route.status) + "20" }]}
              textStyle={{ color: getStatusColor(route.status) }}
            >
              {route.status}
            </Chip>
          </View>

          <View style={styles.routeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Driver:</Text>
              <Text style={styles.value}>{route.driver.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Students:</Text>
              <Text style={styles.value}>{route.students.length}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Stops:</Text>
              <Text style={styles.value}>{route.stops.length}</Text>
            </View>
          </View>

          <View style={styles.timings}>
            <View style={styles.timeSlot}>
              <IconButton icon="bus-clock" size={20} />
              <View>
                <Text style={styles.timeLabel}>Morning Pickup</Text>
                <Text style={styles.timeValue}>{format(new Date(route.morningPickup), "hh:mm a")}</Text>
              </View>
            </View>
            <View style={styles.timeSlot}>
              <IconButton icon="bus-clock" size={20} />
              <View>
                <Text style={styles.timeLabel}>Evening Drop</Text>
                <Text style={styles.timeValue}>{format(new Date(route.eveningDrop), "hh:mm a")}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const StopsList = ({ stops }) => (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Stop Name</DataTable.Title>
        <DataTable.Title numeric>Time</DataTable.Title>
        <DataTable.Title numeric>Students</DataTable.Title>
      </DataTable.Header>

      {stops.map((stop, index) => (
        <DataTable.Row key={index}>
          <DataTable.Cell>{stop.name}</DataTable.Cell>
          <DataTable.Cell numeric>{format(new Date(stop.time), "hh:mm a")}</DataTable.Cell>
          <DataTable.Cell numeric>{stop.students.length}</DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search routes..."
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
            { value: "inactive", label: "Inactive" },
            { value: "maintenance", label: "Maintenance" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRoutes.map((route) => (
          <RouteCard key={route._id} route={route} />
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>Route Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {selectedRoute && (
                <View style={styles.dialogContent}>
                  <Title style={styles.dialogTitle}>{selectedRoute.name}</Title>

                  <Card style={styles.infoCard}>
                    <Card.Content>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Vehicle Number:</Text>
                        <Text style={styles.value}>{selectedRoute.vehicleNumber}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Driver:</Text>
                        <Text style={styles.value}>{selectedRoute.driver.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Contact:</Text>
                        <Text style={styles.value}>{selectedRoute.driver.phone}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Status:</Text>
                        <Chip
                          style={[styles.statusChip, { backgroundColor: getStatusColor(selectedRoute.status) + "20" }]}
                          textStyle={{ color: getStatusColor(selectedRoute.status) }}
                        >
                          {selectedRoute.status}
                        </Chip>
                      </View>
                    </Card.Content>
                  </Card>

                  <Title style={styles.sectionTitle}>Schedule</Title>
                  <Card style={styles.infoCard}>
                    <Card.Content>
                      <StopsList stops={selectedRoute.stops} />
                    </Card.Content>
                  </Card>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("EditRoute", {
                  routeId: selectedRoute._id,
                });
              }}
            >
              Edit
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("TrackRoute", {
                  routeId: selectedRoute._id,
                });
              }}
            >
              Track
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedRouteId(null);
          }}
          anchor={<View />}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedRouteId, "active");
            }}
            title="Mark as Active"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedRouteId, "inactive");
            }}
            title="Mark as Inactive"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedRouteId, "maintenance");
            }}
            title="Mark for Maintenance"
          />
        </Menu>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddRoute")} />
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
  },
  routeInfo: {
    flex: 1,
  },
  title: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  vehicleNumber: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  routeDetails: {
    marginTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    width: 80,
  },
  value: {
    ...theme.typography.body2,
    flex: 1,
  },
  timings: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  timeValue: {
    ...theme.typography.body2,
    color: theme.colors.primary,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  dialog: {
    maxHeight: "80%",
  },
  dialogContent: {
    padding: theme.spacing.md,
  },
  dialogTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    marginVertical: theme.spacing.md,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
