// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Bookmark {
    id: i64,
    title: String,
    url: String,
    #[serde(rename = "createdAt")]
    created_at: String,
}

fn get_bookmarks_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get app data dir");
    
    fs::create_dir_all(&app_data_dir).ok();
    app_data_dir.join("bookmarks.json")
}

#[tauri::command]
fn get_bookmarks(app_handle: tauri::AppHandle) -> Result<Vec<Bookmark>, String> {
    let bookmarks_path = get_bookmarks_path(&app_handle);
    
    if !bookmarks_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = fs::read_to_string(&bookmarks_path)
        .map_err(|e| format!("Failed to read bookmarks: {}", e))?;
    
    let bookmarks: Vec<Bookmark> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse bookmarks: {}", e))?;
    
    Ok(bookmarks)
}

#[tauri::command]
fn add_bookmark(app_handle: tauri::AppHandle, bookmark: Bookmark) -> Result<(), String> {
    let bookmarks_path = get_bookmarks_path(&app_handle);
    
    let mut bookmarks = get_bookmarks(app_handle.clone())?;
    bookmarks.push(bookmark);
    
    let json = serde_json::to_string_pretty(&bookmarks)
        .map_err(|e| format!("Failed to serialize bookmarks: {}", e))?;
    
    fs::write(&bookmarks_path, json)
        .map_err(|e| format!("Failed to write bookmarks: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn delete_bookmark(app_handle: tauri::AppHandle, id: i64) -> Result<(), String> {
    let bookmarks_path = get_bookmarks_path(&app_handle);
    
    let mut bookmarks = get_bookmarks(app_handle.clone())?;
    bookmarks.retain(|b| b.id != id);
    
    let json = serde_json::to_string_pretty(&bookmarks)
        .map_err(|e| format!("Failed to serialize bookmarks: {}", e))?;
    
    fs::write(&bookmarks_path, json)
        .map_err(|e| format!("Failed to write bookmarks: {}", e))?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_bookmarks,
            add_bookmark,
            delete_bookmark,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
