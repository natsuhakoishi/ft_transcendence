import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./style.css";
import { LoginPage } from "./otherPage/auth.tsx";
import { Home } from "./homePage/home";
import { useGlobalErrorMonitor } from "./_hooks/error.ts";
import { LanguageProvider } from "./_hooks/language.tsx";
import { OrientationGuard } from "./_hooks/mobile_orientation.tsx";
import { Matching, TMatching } from "./gamePage/matching";
import { GamePage } from "./gamePage/1v1/online/gamePage.tsx";
import { TournamentGamePage } from "./gamePage/tournament/TournamentGamePage.tsx";
import NotFound from "./otherPage/NotFound";
import { FriendPage } from "./homePage/Friend/friend.tsx";
import { HistoryPage } from "./homePage/MatchHistory/history";
import { ProfilePage } from "./homePage/Profile/profile.tsx";
import { Loading } from "./gamePage/LoadingPage.tsx";
import { AIGamePage } from "./gamePage/1v1/AI/AIGamePage.tsx";
import { FetchData } from "./homePage/helpers.tsx";
import { LocalGamePage } from "./gamePage/1v1/local/lGamePage.tsx";
import { LocalTournamentGamePage } from "./gamePage/tournament/LocalTournamentGamePage.tsx";

function App() {
  function GlobalErrorMonitor() {
    useGlobalErrorMonitor();
    return null;
  }

  return (
    <>
      <Toaster position="top-center" />
      <LanguageProvider>
      <OrientationGuard>
      <GlobalErrorMonitor />
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route element={<FetchData />}>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="/friends" element={<FriendPage />} />
            <Route path="/match_history" element={<HistoryPage />} />
            <Route path="/match_history/:id" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/game" >
            <Route index element={<Navigate to="/" replace />} />
            <Route path="loading" element={<Loading tournament={false} />} />
            <Route path="gameplay" element={<GamePage />} />
            <Route path="tournament/*" element={<TournamentGamePage />} />
            <Route path="tournamentMatching" element={<TMatching />} />
            <Route path="AI/gameplay" element={<AIGamePage />}/>
            <Route path="local/gameplay" element={<LocalGamePage />}/>
            <Route path="local/tournament/*" element={<LocalTournamentGamePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
        </Route>
      </Routes>
      </OrientationGuard>
      </LanguageProvider>
    </>
   );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     {/* <Matching /> */}
//   {/* <MatchingButton /> */}
//     </BrowserRouter>
//   </React.StrictMode>
// );
