const STORIES_KEY = 'storycanvas_stories'

export function loadStoriesFromLocal(): any[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoriesToLocal(stories: any[]) {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
}

export function loadStoryDataFromLocal(storyId: string): any | null {
  try {
    const raw = localStorage.getItem(`storycanvas_data_${storyId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoryDataToLocal(storyId: string, data: any) {
  localStorage.setItem(`storycanvas_data_${storyId}`, JSON.stringify(data))
}

export function deleteStoryDataFromLocal(storyId: string) {
  localStorage.removeItem(`storycanvas_data_${storyId}`)
}
