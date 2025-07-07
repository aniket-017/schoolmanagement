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
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function LibraryManagement({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isBorrowDialogVisible, setIsBorrowDialogVisible] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("/api/library/books");
      setBooks(response.data.data);
      filterBooks(response.data.data, searchQuery, filter);
    } catch (error) {
      showMessage({
        message: "Error fetching books",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterBooks = (bookList, query, status) => {
    let filtered = bookList;

    if (query) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()) ||
          book.isbn.includes(query) ||
          book.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((book) => book.status === status);
    }

    setFilteredBooks(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterBooks(books, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterBooks(books, searchQuery, value);
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await axios.put(`/api/library/books/${bookId}/status`, {
        status: newStatus,
      });

      showMessage({
        message: "Book status updated",
        type: "success",
      });

      fetchBooks();
    } catch (error) {
      showMessage({
        message: "Error updating book status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleBorrowBook = async (bookId, userId, dueDate) => {
    try {
      await axios.post(`/api/library/books/${bookId}/borrow`, {
        userId,
        dueDate,
      });

      showMessage({
        message: "Book borrowed successfully",
        type: "success",
      });

      fetchBooks();
    } catch (error) {
      showMessage({
        message: "Error borrowing book",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      await axios.post(`/api/library/books/${bookId}/return`);

      showMessage({
        message: "Book returned successfully",
        type: "success",
      });

      fetchBooks();
    } catch (error) {
      showMessage({
        message: "Error returning book",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return theme.colors.success;
      case "borrowed":
        return theme.colors.warning;
      case "overdue":
        return theme.colors.error;
      case "maintenance":
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const BookCard = ({ book }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card
        style={styles.card}
        onPress={() => {
          setSelectedBook(book);
          setIsDialogVisible(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Avatar.Icon
                size={40}
                icon="book"
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  marginRight: theme.spacing.sm,
                }}
              />
              <View style={styles.bookInfo}>
                <Title style={styles.title}>{book.title}</Title>
                <Paragraph style={styles.author}>{book.author}</Paragraph>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(book.status) + "20" }]}
              textStyle={{ color: getStatusColor(book.status) }}
            >
              {book.status}
            </Chip>
          </View>

          <View style={styles.bookDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>ISBN:</Text>
              <Text style={styles.value}>{book.isbn}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{book.category}</Text>
            </View>
            {book.status === "borrowed" && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Borrower:</Text>
                  <Text style={styles.value}>{book.borrower.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Due Date:</Text>
                  <Text style={styles.value}>{format(new Date(book.dueDate), "MMM dd, yyyy")}</Text>
                </View>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search books..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={handleFilterChange}
          buttons={[
            { value: "all", label: "All" },
            { value: "available", label: "Available" },
            { value: "borrowed", label: "Borrowed" },
            { value: "overdue", label: "Overdue" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Book Details</Dialog.Title>
          <Dialog.Content>
            {selectedBook && (
              <>
                <Title style={styles.dialogTitle}>{selectedBook.title}</Title>
                <View style={styles.dialogDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Author:</Text>
                    <Text style={styles.value}>{selectedBook.author}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>ISBN:</Text>
                    <Text style={styles.value}>{selectedBook.isbn}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Category:</Text>
                    <Text style={styles.value}>{selectedBook.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Publisher:</Text>
                    <Text style={styles.value}>{selectedBook.publisher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(selectedBook.status) + "20" }]}
                      textStyle={{ color: getStatusColor(selectedBook.status) }}
                    >
                      {selectedBook.status}
                    </Chip>
                  </View>
                  {selectedBook.status === "borrowed" && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Borrower:</Text>
                        <Text style={styles.value}>{selectedBook.borrower.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Due Date:</Text>
                        <Text style={styles.value}>{format(new Date(selectedBook.dueDate), "MMM dd, yyyy")}</Text>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("EditBook", {
                  bookId: selectedBook._id,
                });
              }}
            >
              Edit
            </Button>
            {selectedBook?.status === "available" && (
              <Button
                mode="contained"
                onPress={() => {
                  setIsDialogVisible(false);
                  setSelectedBookId(selectedBook._id);
                  setIsBorrowDialogVisible(true);
                }}
              >
                Borrow
              </Button>
            )}
            {selectedBook?.status === "borrowed" && (
              <Button
                mode="contained"
                onPress={() => {
                  setIsDialogVisible(false);
                  handleReturnBook(selectedBook._id);
                }}
              >
                Return
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>

        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedBookId(null);
          }}
          anchor={<View />}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedBookId, "available");
            }}
            title="Mark as Available"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedBookId, "maintenance");
            }}
            title="Mark for Maintenance"
          />
        </Menu>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddBook")} />
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
  bookInfo: {
    flex: 1,
  },
  title: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  author: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  bookDetails: {
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
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  dialogTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
  },
  dialogDetails: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
