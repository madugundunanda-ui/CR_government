package com.civic.grievance.service;

import com.civic.grievance.dto.DepartmentRequest;
import com.civic.grievance.dto.DepartmentResponse;
import com.civic.grievance.entity.Department;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Department already exists: " + request.getName());
        }
        Department dept = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return mapToResponse(departmentRepository.save(dept));
    }

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public DepartmentResponse getById(Long id) {
        return mapToResponse(departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id)));
    }

    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        return mapToResponse(departmentRepository.save(dept));
    }

    public void delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse mapToResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .createdAt(d.getCreatedAt())
                .build();
    }
}