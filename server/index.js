import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/dashboard' });

// ========== CORS ==========
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// ========== MongoDB Connection ==========
const MONGO_URI = 'mongodb+srv://pavithra:pavithra12345@cluster0.hu4prfg.mongodb.net/emergency_calls?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // Watch for new calls in MongoDB
    const changeStream = Call.watch();

    changeStream.on('change', (change) => {
      console.log('📥 MongoDB change detected:', change.operationType);

      if (change.operationType === 'insert') {
        const newCall = serializeCall(change.fullDocument);
        console.log('🆕 New call:', newCall.priority, newCall.emergency_type);

        // Broadcast to all connected dashboards
        broadcastToClients({
          type: 'new_call',
          data: newCall,
        });
      } else if (change.operationType === 'update') {
        // Handle status updates from other sources
        const updatedId = change.documentKey._id.toString();
        if (change.updateDescription?.updatedFields?.status) {
          broadcastToClients({
            type: 'status_update',
            data: {
              id: updatedId,
              status: change.updateDescription.updatedFields.status,
            },
          });
        }
      }
    });

    changeStream.on('error', (err) => {
      console.error('❌ Change stream error:', err);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========== Schema ==========
const callSchema = new mongoose.Schema({
  priority: String,
  summary: String,
  title: String,
  emergency_type: String,
  location: String,
  timestamp: Date,
  caller_number: String,
  call_duration: Number,
  status: String,
}, { collection: 'calls' });

const Call = mongoose.model('Call', callSchema);

// ========== WebSocket ==========
let dashboardClients = new Set();

wss.on('connection', (ws) => {
  console.log('📡 Dashboard connected');
  dashboardClients.add(ws);

  // Send initial state
  Call.find().sort({ timestamp: -1 }).then(calls => {
    const serialized = calls.map(serializeCall);
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: serialized,
    }));
  });

  ws.on('close', () => {
    console.log('📡 Dashboard disconnected');
    dashboardClients.delete(ws);
  });
});

function broadcastToClients(message) {
  dashboardClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(message));
    }
  });
}

// ========== Helpers ==========
function deriveStatus(priority, manuallyAssigned) {
  // If manually assigned, always show in human_agent
  if (manuallyAssigned) {
    return 'human_agent';
  }

  // Otherwise use priority-based logic
  if (priority === 'P0' || priority === 'P1') {
    return 'human_agent';
  }
  return 'waitlist';
}

function serializeCall(call) {
  // Use stored status, or derive from priority and manually_assigned flag
  const status = call.status || deriveStatus(call.priority, call.manually_assigned);

  return {
    id: call._id.toString(),
    priority: call.priority || 'Unknown',
    emergency_type: call.emergency_type || 'Unknown',
    caller_number: call.caller_number || 'Unknown',
    location: call.location || 'Unknown',
    summary: call.summary || '',
    title: call.title || '',
    timestamp: call.timestamp ? call.timestamp.toISOString() : '',
    status: status,
    call_duration: call.call_duration || 0,
  };
}

// ========== Routes ==========

// Get all calls
app.get('/api/calls', async (req, res) => {
  try {
    const calls = await Call.find().sort({ timestamp: -1 });
    const serialized = calls.map(serializeCall);
    res.json({ total: serialized.length, calls: serialized });
  } catch (err) {
    console.error('Error fetching calls:', err);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Update call status
app.patch('/api/calls/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ai_agent', 'waitlist', 'human_agent', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await Call.findByIdAndUpdate(id, { status });

    // Broadcast to connected dashboards
    broadcastToClients({
      type: 'status_update',
      data: { id, status },
    });

    res.json({ status: 'updated' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Assign call to human agent
app.patch('/api/calls/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;

    // Update the call with manually_assigned flag and change status
    const updatedCall = await Call.findByIdAndUpdate(
      id,
      {
        manually_assigned: true,
        status: 'human_agent'
      },
      { new: true }
    );

    if (!updatedCall) {
      return res.status(404).json({ error: 'Call not found' });
    }

    console.log('✅ Call manually assigned to agent:', id);

    // Broadcast to connected dashboards
    broadcastToClients({
      type: 'status_update',
      data: { id, status: 'human_agent' },
    });

    res.json({ status: 'assigned', call: serializeCall(updatedCall) });
  } catch (err) {
    console.error('Error assigning call:', err);
    res.status(500).json({ error: 'Failed to assign call' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws/dashboard`);
});
