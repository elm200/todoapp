json.array!(@todos) do |todo|
  json.extract! todo, :id, :text, :complete
  json.url todo_url(todo, format: :json)
end
