import { Route, Routes } from 'react-router-dom'
import Launcher from './pages/Launcher'
import MemberLayout from './pages/member/MemberLayout'
import ContactsEntry from './pages/member/ContactsEntry'
import PixelPalFork from './pages/member/PixelPalFork'
import HowItWorks from './pages/member/HowItWorks'
import RequestNeeds from './pages/member/RequestNeeds'
import RequestNote from './pages/member/RequestNote'
import SocialProfilePreview from './pages/member/SocialProfilePreview'
import SocialProfileEdit from './pages/member/SocialProfileEdit'
import PixelPalFinding from './pages/member/PixelPalFinding'
import PixelPalMatchFound from './pages/member/PixelPalMatchFound'
import PixelPalChat from './pages/member/PixelPalChat'
import PixelPalNoMatchYet from './pages/member/PixelPalNoMatchYet'
import Suggestions from './pages/member/Suggestions'
import SayHello from './pages/member/SayHello'
import Pending from './pages/member/Pending'
import Chat from './pages/member/Chat'
import Graduate from './pages/member/Graduate'
import PastConversations from './pages/member/PastConversations'
import PalLayout from './pages/pal/PalLayout'
import PalEntry from './pages/pal/PalEntry'
import PalAbout from './pages/pal/PalAbout'
import ApplyExperience from './pages/pal/ApplyExperience'
import ApplyStory from './pages/pal/ApplyStory'
import ApplyCapacity from './pages/pal/ApplyCapacity'
import ApplyReplyTime from './pages/pal/ApplyReplyTime'
import ApplyAttest from './pages/pal/ApplyAttest'
import ApplicationStatus from './pages/pal/ApplicationStatus'
import PalDashboard from './pages/pal/PalDashboard'
import PalMessages from './pages/pal/PalMessages'
import PalHome from './pages/pal/PalHome'
import PalEdit from './pages/pal/PalEdit'
import IncomingRequest from './pages/pal/IncomingRequest'
import PalChat from './pages/pal/PalChat'
import PalGraduate from './pages/pal/PalGraduate'
import PalGraduationMoment from './pages/pal/PalGraduationMoment'
import Coordinator from './pages/Coordinator'
import TokenShowcase from './pages/TokenShowcase'
import HomeDashboard from './pages/HomeDashboard'
import CommunityGroups from './pages/CommunityGroups'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />

      <Route path="/m" element={<MemberLayout />}>
        <Route index element={<ContactsEntry />} />
        {/* The Find/Become fork. Lives under /m because it's reached from
            the member's own Messages tab — Become just links out to /pal,
            which is a separate seeded protagonist (see the store header). */}
        <Route path="pixel-pal" element={<PixelPalFork />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="request/needs" element={<RequestNeeds />} />
        <Route path="request/note" element={<RequestNote />} />
        <Route path="social-profile-preview" element={<SocialProfilePreview />} />
        <Route path="social-profile-edit" element={<SocialProfileEdit />} />
        <Route path="finding" element={<PixelPalFinding />} />
        <Route path="match-found" element={<PixelPalMatchFound />} />
        <Route path="pixel-pal-chat" element={<PixelPalChat />} />
        <Route path="no-match-yet" element={<PixelPalNoMatchYet />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="say-hello" element={<SayHello />} />
        <Route path="pending" element={<Pending />} />
        <Route path="chat/:relationshipId" element={<Chat />} />
        <Route path="graduate/:relationshipId" element={<Graduate />} />
        <Route path="past" element={<PastConversations />} />
      </Route>

      <Route path="/pal" element={<PalLayout />}>
        {/* Index is a router, not a screen — it reads her application state
            and sends her to the right place (see PalEntry). */}
        <Route index element={<PalEntry />} />
        <Route path="about" element={<PalAbout />} />
        <Route path="apply/experience" element={<ApplyExperience />} />
        <Route path="apply/story" element={<ApplyStory />} />
        <Route path="apply/capacity" element={<ApplyCapacity />} />
        <Route path="apply/reply-time" element={<ApplyReplyTime />} />
        <Route path="apply/attest" element={<ApplyAttest />} />
        <Route path="status" element={<ApplicationStatus />} />
        <Route path="dashboard" element={<PalDashboard />} />
        <Route path="messages" element={<PalMessages />} />
        <Route path="home" element={<PalHome />} />
        <Route path="edit" element={<PalEdit />} />
        <Route path="request/:relationshipId" element={<IncomingRequest />} />
        <Route path="chat/:relationshipId" element={<PalChat />} />
        <Route path="graduate/:relationshipId" element={<PalGraduate />} />
        <Route path="graduation/:relationshipId" element={<PalGraduationMoment />} />
      </Route>
      <Route path="/bo/*" element={<Coordinator />} />
      <Route path="/tokens" element={<TokenShowcase />} />
      <Route path="/home" element={<HomeDashboard />} />
      <Route path="/groups" element={<CommunityGroups />} />
    </Routes>
  )
}

export default App
