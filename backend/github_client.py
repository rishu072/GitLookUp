import requests
import datetime
import math
from typing import Dict, Any, List, Optional
from backend.config import Config
from backend.cache_manager import CacheManager

class GitHubClient:
    BASE_URL = "https://api.github.com"

    @classmethod
    def _get_headers(cls) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitPulse-Analytics-Dashboard"
        }
        if Config.GITHUB_TOKEN:
            headers["Authorization"] = f"token {Config.GITHUB_TOKEN}"
        return headers

    @classmethod
    def get_rate_limit(cls) -> Dict[str, Any]:
        """Fetch the current rate limit status from GitHub API."""
        try:
            url = f"{cls.BASE_URL}/rate_limit"
            resp = requests.get(url, headers=cls._get_headers(), timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "limit": data["resources"]["core"]["limit"],
                    "remaining": data["resources"]["core"]["remaining"],
                    "reset_time": data["resources"]["core"]["reset"],
                    "authenticated": bool(Config.GITHUB_TOKEN)
                }
        except Exception as e:
            print(f"Error fetching rate limit: {e}")
        
        # Fallback
        return {
            "limit": 60 if not Config.GITHUB_TOKEN else 5000,
            "remaining": 0,
            "reset_time": int(datetime.datetime.now().timestamp()) + 3600,
            "authenticated": bool(Config.GITHUB_TOKEN),
            "error": "Failed to connect to GitHub API"
        }

    @classmethod
    def get_user_stats(cls, username: str) -> tuple[Optional[Dict[str, Any]], int]:
        """
        Fetch and process all GitHub analytics data for a user.
        Returns (payload_dict, HTTP_status_code).
        """
        username = username.strip()
        if not username:
            return {"error": "Username cannot be empty"}, 400

        # Check Cache
        cached_data = CacheManager.get(username)
        if cached_data:
            print(f"Serving cache for user: {username}")
            cached_data["cached"] = True
            return cached_data, 200

        print(f"Fetching fresh data for user: {username} from GitHub API...")
        headers = cls._get_headers()
        
        # 1. Fetch Profile
        user_url = f"{cls.BASE_URL}/users/{username}"
        try:
            user_resp = requests.get(user_url, headers=headers, timeout=15)
        except requests.RequestException as e:
            return {"error": f"Failed to connect to GitHub API: {str(e)}"}, 502

        if user_resp.status_code == 404:
            return {"error": "GitHub user not found"}, 404
        elif user_resp.status_code == 403:
            # Check if rate limited
            rl_info = cls.get_rate_limit()
            if rl_info.get("remaining", 0) == 0:
                return {
                    "error": "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to the backend to increase limits."
                }, 403
            return {"error": "Access forbidden by GitHub API"}, 403
        elif user_resp.status_code != 200:
            return {"error": f"GitHub API error: status {user_resp.status_code}"}, user_resp.status_code

        user_data = user_resp.json()

        # 2. Fetch Repos (paginated, max 100 for performance/limits)
        repos_url = f"{cls.BASE_URL}/users/{username}/repos?per_page=100&sort=updated"
        repos_list = []
        try:
            repos_resp = requests.get(repos_url, headers=headers, timeout=15)
            if repos_resp.status_code == 200:
                repos_list = repos_resp.json()
        except Exception as e:
            print(f"Error fetching repos for {username}: {e}")

        # 3. Fetch Events (max 100)
        events_url = f"{cls.BASE_URL}/users/{username}/events?per_page=100"
        events_list = []
        try:
            events_resp = requests.get(events_url, headers=headers, timeout=15)
            if events_resp.status_code == 200:
                events_list = events_resp.json()
        except Exception as e:
            print(f"Error fetching events for {username}: {e}")

        # 4. Process Repositories & Language distribution
        total_stars = 0
        total_forks = 0
        total_size = 0
        languages = {}
        processed_repos = []
        
        most_starred_repo = None
        most_forked_repo = None
        
        max_stars = -1
        max_forks = -1

        for r in repos_list:
            r_stars = r.get("stargazers_count", 0)
            r_forks = r.get("forks_count", 0)
            r_size = r.get("size", 0) # in KB
            r_lang = r.get("language")
            
            total_stars += r_stars
            total_forks += r_forks
            total_size += r_size
            
            if r_lang:
                languages[r_lang] = languages.get(r_lang, 0) + 1

            repo_info = {
                "name": r.get("name"),
                "full_name": r.get("full_name"),
                "html_url": r.get("html_url"),
                "description": r.get("description"),
                "language": r_lang,
                "stars": r_stars,
                "forks": r_forks,
                "size_kb": r_size,
                "created_at": r.get("created_at"),
                "updated_at": r.get("updated_at"),
                "pushed_at": r.get("pushed_at"),
                "open_issues": r.get("open_issues_count", 0)
            }
            processed_repos.append(repo_info)
            
            if r_stars > max_stars:
                max_stars = r_stars
                most_starred_repo = r.get("name")
            if r_forks > max_forks:
                max_forks = r_forks
                most_forked_repo = r.get("name")

        # Sort repos by updated_at descending
        processed_repos.sort(key=lambda x: x["updated_at"] or "", reverse=True)

        # 5. Compute repo creation timeline
        repo_creation_by_month = {}
        for r in processed_repos:
            created_str = r["created_at"]
            if created_str:
                ym = created_str[:7]
                repo_creation_by_month[ym] = repo_creation_by_month.get(ym, 0) + 1

        sorted_months = sorted(repo_creation_by_month.keys())
        repo_creation_trend = []
        cumulative_repos = 0
        for ym in sorted_months:
            count = repo_creation_by_month[ym]
            cumulative_repos += count
            repo_creation_trend.append({
                "date": ym,
                "count": count,
                "cumulative": cumulative_repos
            })

        # 6. Follower trend simulation
        created_at_dt = datetime.datetime.strptime(user_data["created_at"][:10], "%Y-%m-%d")
        now_dt = datetime.datetime.now()
        days_active = max((now_dt - created_at_dt).days, 1)
        total_followers = user_data.get("followers", 0)
        
        follower_trend = []
        if total_followers > 0:
            num_points = min(12, math.ceil(days_active / 30))
            num_points = max(num_points, 2)
            
            for i in range(num_points):
                fraction = (i + 1) / num_points
                log_frac = math.log(1 + fraction * 9) / math.log(10)
                current_count = int(total_followers * log_frac)
                current_count = max(current_count, min(i + 1, total_followers))
                
                sim_days = int(days_active * fraction)
                sim_dt = created_at_dt + datetime.timedelta(days=sim_days)
                follower_trend.append({
                    "date": sim_dt.strftime("%Y-%m"),
                    "count": current_count
                })
        else:
            follower_trend = [{"date": now_dt.strftime("%Y-%m"), "count": 0}]

        # 7. Aggregate recent activity from events
        activity_by_date = {}
        for ev in events_list:
            ev_date = ev.get("created_at", "")[:10]
            if ev_date:
                ev_type = ev.get("type", "Other")
                if ev_date not in activity_by_date:
                    activity_by_date[ev_date] = {}
                activity_by_date[ev_date][ev_type] = activity_by_date[ev_date].get(ev_type, 0) + 1
        
        sorted_activity_dates = sorted(activity_by_date.keys())
        activity_trend = []
        for d in sorted_activity_dates:
            total_activity = sum(activity_by_date[d].values())
            activity_trend.append({
                "date": d,
                "count": total_activity,
                "breakdown": activity_by_date[d]
            })

        # 8. Milestones (Achievements)
        milestones = []
        
        age_years = days_active / 365.25
        if age_years >= 10:
            milestones.append({"id": "age_10", "title": "Decade Developer", "desc": "Account is over 10 years old", "unlocked": True, "category": "age"})
        elif age_years >= 5:
            milestones.append({"id": "age_5", "title": "Open Source Veteran", "desc": "Account is over 5 years old", "unlocked": True, "category": "age"})
        elif age_years >= 1:
            milestones.append({"id": "age_1", "title": "Yearling", "desc": "Account is over 1 year old", "unlocked": True, "category": "age"})
        else:
            milestones.append({"id": "age_1", "title": "Yearling", "desc": "Account is over 1 year old", "unlocked": False, "category": "age"})

        repo_count = len(repos_list)
        if repo_count >= 100:
            milestones.append({"id": "repos_100", "title": "Code Empire", "desc": "Created 100+ repositories", "unlocked": True, "category": "code"})
        elif repo_count >= 50:
            milestones.append({"id": "repos_50", "title": "Code Machine", "desc": "Created 50+ repositories", "unlocked": True, "category": "code"})
        elif repo_count >= 10:
            milestones.append({"id": "repos_10", "title": "Active Builder", "desc": "Created 10+ repositories", "unlocked": True, "category": "code"})
        else:
            milestones.append({"id": "repos_10", "title": "Active Builder", "desc": "Created 10+ repositories", "unlocked": False, "category": "code"})

        if repo_count > 0:
            milestones.append({"id": "repos_1", "title": "First Commit", "desc": "Created at least 1 repository", "unlocked": True, "category": "code"})
        else:
            milestones.append({"id": "repos_1", "title": "First Commit", "desc": "Created at least 1 repository", "unlocked": False, "category": "code"})

        if total_stars >= 500:
            milestones.append({"id": "stars_500", "title": "GitHub Icon", "desc": "Earned 500+ stars", "unlocked": True, "category": "stars"})
        elif total_stars >= 50:
            milestones.append({"id": "stars_50", "title": "Local Celebrity", "desc": "Earned 50+ stars", "unlocked": True, "category": "stars"})
        elif total_stars >= 5:
            milestones.append({"id": "stars_5", "title": "Rising Star", "desc": "Earned 5+ stars", "unlocked": True, "category": "stars"})
        else:
            milestones.append({"id": "stars_5", "title": "Rising Star", "desc": "Earned 5+ stars", "unlocked": False, "category": "stars"})

        if total_followers >= 1000:
            milestones.append({"id": "followers_1000", "title": "Tech Influencer", "desc": "Has 1,000+ followers", "unlocked": True, "category": "followers"})
        elif total_followers >= 100:
            milestones.append({"id": "followers_100", "title": "Crowd Pleaser", "desc": "Has 100+ followers", "unlocked": True, "category": "followers"})
        elif total_followers >= 10:
            milestones.append({"id": "followers_10", "title": "Social Coder", "desc": "Has 10+ followers", "unlocked": True, "category": "followers"})
        else:
            milestones.append({"id": "followers_10", "title": "Social Coder", "desc": "Has 10+ followers", "unlocked": False, "category": "followers"})

        lang_count = len(languages)
        if lang_count >= 5:
            milestones.append({"id": "lang_5", "title": "Universal Polyglot", "desc": "Worked with 5+ languages", "unlocked": True, "category": "languages"})
        elif lang_count >= 3:
            milestones.append({"id": "lang_3", "title": "Multilingual", "desc": "Worked with 3+ languages", "unlocked": True, "category": "languages"})
        else:
            milestones.append({"id": "lang_3", "title": "Multilingual", "desc": "Worked with 3+ languages", "unlocked": False, "category": "languages"})

        milestones.sort(key=lambda x: (not x["unlocked"], x["category"]))

        avg_size = int(total_size / repo_count) if repo_count > 0 else 0
        
        payload = {
            "cached": False,
            "timestamp": int(datetime.datetime.now().timestamp()),
            "user": {
                "login": user_data.get("login"),
                "name": user_data.get("name") or user_data.get("login"),
                "avatar_url": user_data.get("avatar_url"),
                "html_url": user_data.get("html_url"),
                "bio": user_data.get("bio"),
                "location": user_data.get("location"),
                "blog": user_data.get("blog"),
                "twitter": user_data.get("twitter_username"),
                "company": user_data.get("company"),
                "public_repos": user_data.get("public_repos", 0),
                "public_gists": user_data.get("public_gists", 0),
                "followers": total_followers,
                "following": user_data.get("following", 0),
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at")
            },
            "repos": processed_repos,
            "languages": languages,
            "stats": {
                "total_stars": total_stars,
                "total_forks": total_forks,
                "average_repo_size_kb": avg_size,
                "most_starred_repo": most_starred_repo,
                "most_forked_repo": most_forked_repo,
                "languages_count": lang_count
            },
            "milestones": milestones,
            "activity_trend": activity_trend,
            "repo_creation_trend": repo_creation_trend,
            "follower_trend": follower_trend
        }

        # Save to Cache
        CacheManager.set(username, payload)

        return payload, 200
