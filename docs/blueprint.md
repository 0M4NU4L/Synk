# **App Name**: TeamFlow

## Core Features:

- Secure Authentication: Google and Email/Password authentication using Firebase.
- Real-time Video/Audio Conferencing: Utilize LiveKit for high-quality, low-latency video and audio calls, including screen sharing.
- Interactive Whiteboard: Collaborative canvas for real-time drawing and annotations, synchronized via LiveKit Data Channels.
- Task Management (Kanban): Drag-and-drop Kanban board powered by dnd-kit, enabling teams to organize and track tasks efficiently.
- Google Drive Integration: Seamlessly attach files from Google Drive, with metadata stored in Firestore for easy access and management.
- AI-Powered Meeting Summarizer: AI tool transcribes the audio from the meeting, then summarizes action items and decisions made, highlighting key points. 
- Room Management: Users can create and join rooms using unique IDs, managed via Firestore.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) – A vibrant blue (#3391FF) to convey trust and collaboration.
- Background color: HSL(210, 20%, 95%) – A light, desaturated blue (#F0F5FA) for a clean and modern feel.
- Accent color: HSL(180, 60%, 40%) – A contrasting teal (#33A3A3) to highlight key actions and elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern and neutral look. Note: currently only Google Fonts are supported.
- Use a consistent set of line icons from a library like Feather or Material Icons, customized to match the color palette.
- Maintain a clean, tabbed layout with a clear hierarchy, ensuring ease of navigation and content discoverability.
- Incorporate subtle transitions and animations to enhance user experience, such as fading in new content or smoothly transitioning between tabs.