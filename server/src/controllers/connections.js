import { storage } from '../storage.js';

// Get all connections for a user
export const getConnections = async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const connections = await storage.getConnections(userId);
    
    res.json(connections);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ 
      message: 'Failed to get connections', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Create a new connection
export const createConnection = async (req, res) => {
  try {
    const connectionData = req.body;
    
    if (!connectionData.fromUserId || !connectionData.toUserId) {
      return res.status(400).json({ message: 'From user ID and to user ID are required' });
    }
    
    // Implement connection creation using your storage
    const booking = await storage.createBooking({
      userId: connectionData.fromUserId,
      guideId: connectionData.toUserId,
      status: 'pending',
      message: connectionData.message,
      tripDetails: connectionData.tripDetails,
      budget: connectionData.budget
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ 
      message: 'Failed to create connection', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update connection status
export const updateConnectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ message: 'Connection ID and status are required' });
    }
    
    // Implement status update using your storage
    const booking = await storage.bookings.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating connection status:', error);
    res.status(500).json({ 
      message: 'Failed to update connection status', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Delete connection
export const deleteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Connection ID is required' });
    }
    
    // Implement connection deletion using your storage
    const result = await storage.bookings.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ 
      message: 'Failed to delete connection', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 