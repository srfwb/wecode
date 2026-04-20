use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Default)]
pub struct VfsState(pub Mutex<HashMap<String, String>>);
