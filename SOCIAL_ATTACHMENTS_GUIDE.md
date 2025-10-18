# LinkedIn-Style Post Attachments Feature

## 🎯 Overview

This feature allows users to attach their study materials (notes, flashcards, quizzes) and external files to social posts, similar to how LinkedIn allows document sharing. This creates a powerful bridge between personal study content and social sharing.

## 📦 What Was Added

### 1. Database Tables

**`post_attachments`** - Links posts to study materials
- Stores references to notes, flashcards, quizzes, or files
- Validates that attachments belong to the post author
- Supports metadata for rich previews

**`post_files`** - Uploaded external files
- Stores PDFs, images, documents
- Integrates with Supabase Storage
- Tracks file metadata (size, type, etc.)

### 2. TypeScript Services

**`postAttachmentsService`** - Manage post attachments
- Attach study materials to posts
- Attach files to posts
- Retrieve attachments with details
- Remove attachments
- Get user's study materials for selection

**`fileUploadService`** - Handle file uploads
- Upload files to Supabase Storage
- Track file metadata
- Delete files and cleanup storage

### 3. Database Features

- **Validation triggers** - Ensures attachments exist and belong to post author
- **Helper views** - Posts with attachments included
- **RLS policies** - Secure attachment access based on post visibility
- **Helper functions** - Get detailed attachment info

## 🚀 Setup Instructions

### Step 1: Run the Migration

1. **First**, ensure you've run `social_migration.sql` (the base social features)
2. **Then**, run the new migration:

```bash
# In Supabase SQL Editor
# Copy and paste: social_attachments_migration.sql
```

### Step 2: Create Storage Bucket (if using file uploads)

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `post-files`
3. Set it to **public** (or configure RLS policies)

### Step 3: Test the Feature

The service is ready to use! No additional frontend changes required initially.

## 💻 Usage Examples

### Attach a Note to a Post

```typescript
import { postAttachmentsService } from './services/social';

// After creating a post
const post = await socialPostsService.createPost({
  content: "Check out my calculus notes!",
  post_type: 'resource_share',
  tags: ['Mathematics', 'Calculus'],
  visibility: 'public',
  is_pinned: false,
  likes_count: 0,
  comments_count: 0,
  shares_count: 0
});

if (post) {
  // Attach a note
  await postAttachmentsService.attachStudyMaterial(
    post.id!,
    'note',
    'note-uuid-here',
    'Calculus Chapter 5 Notes',
    'Derivatives and integrals...',
    { subject: 'Mathematics', word_count: 1500 }
  );
}
```

### Attach Multiple Materials to One Post

```typescript
const postId = 'post-uuid-here';

// Attach a note
await postAttachmentsService.attachStudyMaterial(
  postId,
  'note',
  noteId,
  'Study Notes',
  'Preview text...'
);

// Attach flashcards
await postAttachmentsService.attachStudyMaterial(
  postId,
  'flashcard',
  flashcardDeckId,
  'Practice Flashcards'
);

// Attach a quiz
await postAttachmentsService.attachStudyMaterial(
  postId,
  'quiz',
  quizId,
  'Practice Quiz'
);
```

### Get User's Study Materials for Selection

```typescript
// When user clicks "Attach Study Material"
const materials = await postAttachmentsService.getUserStudyMaterials();

console.log(materials.notes); // User's notes
console.log(materials.flashcards); // User's flashcard decks
console.log(materials.quizzes); // User's quizzes

// Display in a selection UI
```

### Display Post with Attachments

```typescript
// Fetch post attachments
const attachments = await postAttachmentsService.getPostAttachments(postId);

// Get detailed info for each attachment
for (const attachment of attachments) {
  const details = await postAttachmentsService.getAttachmentDetails(attachment.id!);
  
  console.log('Attachment:', {
    type: attachment.attachment_type,
    title: attachment.attachment_title,
    details: details
  });
}
```

### Upload and Attach a File

```typescript
import { fileUploadService, postAttachmentsService } from './services/social';

// Upload a file
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const uploadedFile = await fileUploadService.uploadFile(file);

if (uploadedFile) {
  // Attach to post
  await postAttachmentsService.attachFile(
    postId,
    uploadedFile.id!,
    uploadedFile.file_name
  );
}
```

## 🎨 UI Components to Build

### 1. Attachment Selector Modal

When creating/editing a post:

```tsx
function AttachmentSelector({ onAttach }) {
  const [materials, setMaterials] = useState({ notes: [], flashcards: [], quizzes: [] });
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const data = await postAttachmentsService.getUserStudyMaterials();
    setMaterials(data);
  };

  return (
    <Dialog>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notes">Notes ({materials.notes.length})</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards ({materials.flashcards.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes ({materials.quizzes.length})</TabsTrigger>
          <TabsTrigger value="files">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          {materials.notes.map(note => (
            <div key={note.id} onClick={() => onAttach('note', note)}>
              <h4>{note.title}</h4>
              <p>{note.subject} • {note.word_count} words</p>
            </div>
          ))}
        </TabsContent>

        {/* Similar for other tabs */}
      </Tabs>
    </Dialog>
  );
}
```

### 2. Attachment Display in Post

```tsx
function PostAttachments({ postId }) {
  const [attachments, setAttachments] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadAttachments();
  }, [postId]);

  const loadAttachments = async () => {
    const atts = await postAttachmentsService.getPostAttachments(postId);
    setAttachments(atts);

    // Load details for each
    const detailsMap = {};
    for (const att of atts) {
      const detail = await postAttachmentsService.getAttachmentDetails(att.id);
      detailsMap[att.id] = detail;
    }
    setDetails(detailsMap);
  };

  return (
    <div className="post-attachments">
      {attachments.map(attachment => (
        <AttachmentCard
          key={attachment.id}
          attachment={attachment}
          details={details[attachment.id]}
        />
      ))}
    </div>
  );
}

function AttachmentCard({ attachment, details }) {
  const getIcon = () => {
    switch (attachment.attachment_type) {
      case 'note': return <FileText />;
      case 'flashcard': return <CreditCard />;
      case 'quiz': return <ClipboardCheck />;
      case 'file': return <Paperclip />;
    }
  };

  return (
    <Card className="attachment-card">
      {getIcon()}
      <div>
        <h4>{attachment.attachment_title}</h4>
        {attachment.attachment_type === 'note' && details && (
          <p>{details.word_count} words</p>
        )}
        {attachment.attachment_type === 'flashcard' && details && (
          <p>{details.card_count} cards</p>
        )}
        {attachment.attachment_type === 'quiz' && details && (
          <p>{details.question_count} questions</p>
        )}
        {attachment.attachment_type === 'file' && details && (
          <p>{(details.file_size / 1024).toFixed(1)} KB</p>
        )}
      </div>
    </Card>
  );
}
```

### 3. Enhanced Post Creation

```tsx
function CreatePost() {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachSelector, setShowAttachSelector] = useState(false);

  const handleCreatePost = async () => {
    // Create post
    const post = await socialPostsService.createPost({
      content,
      post_type: attachments.length > 0 ? 'resource_share' : 'regular',
      tags: extractTags(content),
      visibility: 'public',
      is_pinned: false,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0
    });

    if (post) {
      // Attach all selected materials
      for (const att of attachments) {
        await postAttachmentsService.attachStudyMaterial(
          post.id!,
          att.type,
          att.id,
          att.title,
          att.preview,
          att.metadata
        );
      }
    }
  };

  return (
    <Card>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your study progress..."
      />

      {/* Show attached materials */}
      <div className="attachments-preview">
        {attachments.map(att => (
          <Chip key={att.id} onRemove={() => removeAttachment(att.id)}>
            {att.title}
          </Chip>
        ))}
      </div>

      <div className="post-actions">
        <Button
          variant="ghost"
          onClick={() => setShowAttachSelector(true)}
        >
          <Paperclip className="w-4 h-4 mr-2" />
          Attach Study Material
        </Button>

        <Button onClick={handleCreatePost}>
          Post
        </Button>
      </div>

      {showAttachSelector && (
        <AttachmentSelector
          onAttach={(type, item) => {
            setAttachments([...attachments, { type, ...item }]);
            setShowAttachSelector(false);
          }}
          onClose={() => setShowAttachSelector(false)}
        />
      )}
    </Card>
  );
}
```

## 🔒 Security Features

### Row Level Security

- **Attachments visible** only if the post is visible to the user
- **Only post authors** can add/remove attachments
- **Files are secured** based on post visibility
- **Validation ensures** attachments belong to post author

### Validation

- Automatic validation that study materials exist
- Verification that materials belong to the post author
- File size and type validation (in frontend)
- Storage quota management

## 📊 Data Flow

### Creating Post with Attachments

```
1. User creates post
   ↓
2. Post saved to social_posts
   ↓
3. For each attachment:
   - Validate material exists
   - Validate ownership
   - Create attachment record
   ↓
4. Trigger updates metadata
   ↓
5. Post displayed with attachments
```

### Viewing Post with Attachments

```
1. Load post from social_posts_with_attachments view
   ↓
2. Attachments included in response
   ↓
3. Lazy load full details on expand
   ↓
4. Display with appropriate icons/previews
```

## 🎯 Use Cases

### For Students

1. **Share Study Guides**: Post notes and let others benefit
2. **Recommend Resources**: Attach helpful flashcards to posts
3. **Study Group Materials**: Share quiz materials with group
4. **Achievement Posts**: Show off completed study materials
5. **Ask for Feedback**: Share notes and ask for improvements

### LinkedIn-like Features

1. **Document Sharing**: Like LinkedIn's document posts
2. **Portfolio Building**: Showcase study achievements
3. **Resource Discovery**: Find helpful materials from others
4. **Collaborative Learning**: Share and discuss materials
5. **Professional Presentation**: Display study work professionally

## 📈 Analytics Potential

Track engagement with attachments:
- Most shared material types
- Popular study subjects
- Material discovery through posts
- Study material influence on engagement

## 🚧 Future Enhancements

### Phase 2
- [ ] Preview rendering for notes (first 200 chars)
- [ ] Thumbnail generation for files
- [ ] Download analytics
- [ ] Material versioning (updates to shared materials)

### Phase 3
- [ ] Rich embeds for external links
- [ ] Video attachments
- [ ] Audio notes
- [ ] Collaborative editing permissions

### Phase 4
- [ ] AI-generated summaries of attachments
- [ ] Smart recommendations ("You might also like...")
- [ ] Material remix/forking
- [ ] Cross-post to multiple groups

## ✅ Testing Checklist

- [ ] Can attach note to post
- [ ] Can attach flashcard deck to post
- [ ] Can attach quiz to post
- [ ] Can upload and attach file
- [ ] Attachments display correctly
- [ ] Can remove attachments
- [ ] Can't attach others' materials
- [ ] Attachments respect post visibility
- [ ] File upload size limits work
- [ ] Multiple attachments per post work

## 🔧 Troubleshooting

### Attachments not appearing
1. Check RLS policies are created
2. Verify post_attachments table exists
3. Check attachment validation trigger

### Can't attach materials
1. Ensure materials belong to current user
2. Verify post exists and belongs to user
3. Check validation function is working

### File uploads failing
1. Verify storage bucket exists and is public
2. Check file size limits
3. Ensure user is authenticated

## 📚 API Reference Summary

### postAttachmentsService

- `attachStudyMaterial()` - Attach note/flashcard/quiz
- `attachFile()` - Attach uploaded file
- `getPostAttachments()` - Get all attachments for post
- `getAttachmentDetails()` - Get full details for attachment
- `removeAttachment()` - Remove attachment from post
- `getUserStudyMaterials()` - Get user's materials for selection

### fileUploadService

- `uploadFile()` - Upload file to storage
- `deleteFile()` - Delete file and cleanup

## 🎉 Benefits

### For Users
✅ Share study materials easily
✅ Build study portfolio
✅ Help others learn
✅ Get feedback on materials
✅ Discover new resources

### For Platform
✅ Increased engagement
✅ More valuable content
✅ User-generated resources
✅ Community building
✅ LinkedIn-like professionalism

---

**Ready to implement!** The database and services are complete. Just build the UI components and you'll have a powerful LinkedIn-style attachment feature! 🚀
