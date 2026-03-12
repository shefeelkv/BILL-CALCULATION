
import os

content = """{% extends 'base_app.html' %}

{% block page_title %}My Notes{% endblock %}

{% block content %}
<div class="d-flex justify-content-between mb-4">
    <div><!-- Filters could go here --></div>
    <a href="{% url 'create_note' %}" class="btn btn-primary"><i class="fas fa-plus me-2"></i> New Note</a>
</div>

<div class="row g-4">
    {% for note in notes %}
    <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0 {% if note.is_pinned %}border-top border-primary border-3{% endif %}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title fw-bold mb-0 text-dark">
                        {% if note.is_pinned %}<i class="fas fa-thumbtack text-primary me-2 transform-rotate-45"></i>{% endif %}
                        {{ note.title }}
                    </h5>
                    <div class="dropdown">
                        <button class="btn btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="{% url 'edit_note' note.id %}"><i class="fas fa-edit me-2"></i> Edit</a></li>
                            <li><a class="dropdown-item text-danger" href="{% url 'delete_note' note.id %}"><i class="fas fa-trash me-2"></i> Delete</a></li>
                        </ul>
                    </div>
                </div>
                <h6 class="card-subtitle mb-3 text-muted small">{{ note.category }} • {{ note.created_at|date:"M d, Y" }}</h6>
                
                <p class="card-text text-secondary">
                    <ul class="list-unstyled mb-0">
                        {% for item in note.items.all|slice:":3" %}
                        <li class="d-flex justify-content-between small">
                            <span>{{ item.item_name }}</span>
                            <span class="fw-bold">${{ item.price|stringformat:".0f" }}</span>
                        </li>
                        {% endfor %}
                        {% if note.items.count > 3 %}
                        <li class="text-muted small mt-1">+ {{ note.items.count|add:"-3" }} more items...</li>
                        {% endif %}
                    </ul>
                </p>
            </div>
            <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                <span class="badge bg-light text-dark border">Total: ${{ note.total_amount|stringformat:".2f" }}</span>
                <a href="{% url 'note_detail' note.id %}" class="btn btn-sm btn-outline-primary rounded-pill px-3">View</a>
            </div>
        </div>
    </div>
    {% empty %}
    <div class="col-12 text-center py-5">
        <div class="text-muted">
            <i class="fas fa-sticky-note fa-3x mb-3 opacity-50"></i>
            <p>No notes yet. Keep track of important things here!</p>
        </div>
    </div>
    {% endfor %}
</div>
{% endblock %}
"""

file_path = os.path.join(os.getcwd(), 'django_project', 'templates', 'note_list.html')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully wrote to {file_path}")
