// src/screens/ProfileScreen.tsx
// Private personnel profile screen displaying verified lifetime statistics.
// Enforces strict private ownership — only the authenticated user's records are shown.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, fetchCurrentProfile, type UserProfile } from '../services/authService';
import { fetchPlayerStats, type PlayerStats } from '../services/gamePersistenceService';
import { useGameStore } from '../store/gameStore';
import styles from './ProfileScreen.module.css';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const authUserId = useGameStore((state) => state.authUserId);
  const setAuthUserId = useGameStore((state) => state.setAuthUserId);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!authUserId) return;
      try {
        const [profileData, statsData] = await Promise.all([
          fetchCurrentProfile(authUserId),
          fetchPlayerStats(authUserId),
        ]);
        if (mounted) {
          setProfile(profileData);
          setStats(statsData);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [authUserId]);

  const handleSignOut = async () => {
    await signOut();
    setAuthUserId(null);
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>PERSONNEL DOSSIER // VERIFIED STATUS</span>
          <div className={styles.navActions}>
            <Link to="/" className={styles.navBtn}>
              MAIN MENU
            </Link>
            <button type="button" onClick={handleSignOut} className={styles.logoutBtn}>
              DISCONNECT
            </button>
          </div>
        </header>

        <div className={styles.profileCard}>
          <div className={styles.identityArea}>
            <div>
              <h1 className={styles.callsign}>
                {profile?.displayName || profile?.username || 'OPERATOR'}
              </h1>
              <div className={styles.displayName}>
                CALLSIGN: @{profile?.username || 'unknown'}
              </div>
            </div>
            <span className={styles.statusBadge}>ACTIVE OPERATOR</span>
          </div>

          {loading ? (
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-fog)', padding: '2rem 0' }}>
              RETRIEVING DOSSIER METRICS...
            </div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>AVERAGE READINESS</span>
                  <span className={styles.statValue}>
                    {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : '0%'}
                  </span>
                  <span className={styles.statSubtext}>NDMA Protocol Adherence</span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>PEAK SCORE</span>
                  <span className={styles.statValue}>
                    {stats?.bestScore ? `${stats.bestScore}/100` : '0/100'}
                  </span>
                  <span className={styles.statSubtext}>Highest Session Rating</span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>SIMULATIONS COMPLETED</span>
                  <span className={styles.statValue}>{stats?.completedRuns ?? 0}</span>
                  <span className={styles.statSubtext}>
                    {stats?.totalRuns ?? 0} Total Initiated
                  </span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>SURVIVAL EVACUATIONS</span>
                  <span className={styles.statValue}>{stats?.survivedRuns ?? 0}</span>
                  <span className={styles.statSubtext}>Safe Evacuation Outcomes</span>
                </div>
              </div>

              <div className={styles.disasterBreakdown}>
                <h3 className={styles.sectionTitle}>DISASTER EXPERIENCE BREAKDOWN</h3>
                <div className={styles.disasterRow}>
                  <div className={styles.disasterBadge}>
                    <span>EARTHQUAKE:</span>
                    <strong>{stats?.earthquakeRuns ?? 0}</strong>
                  </div>
                  <div className={styles.disasterBadge}>
                    <span>STRUCTURE FIRE:</span>
                    <strong>{stats?.fireRuns ?? 0}</strong>
                  </div>
                  <div className={styles.disasterBadge}>
                    <span>FLASH FLOOD:</span>
                    <strong>{stats?.floodRuns ?? 0}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className={styles.actionRow}>
            <Link to="/select" className={styles.playBtn}>
              LAUNCH SIMULATION CONSOLE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
