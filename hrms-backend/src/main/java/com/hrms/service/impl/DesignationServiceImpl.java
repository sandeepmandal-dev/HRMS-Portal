package com.hrms.service.impl;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.DesignationResponse;
import com.hrms.entity.Designation;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.DesignationRepository;
import com.hrms.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationServiceImpl implements DesignationService {

    private final DesignationRepository designationRepository;

    @Override
    @Transactional
    public DesignationResponse create(DesignationRequest request) {
        if (designationRepository.existsByTitleIgnoreCase(request.title())) {
            throw new DuplicateResourceException("Designation '" + request.title() + "' already exists");
        }
        Designation designation = Designation.builder()
                .title(request.title())
                .description(request.description())
                .active(true)
                .build();
        return toResponse(designationRepository.save(designation));
    }

    @Override
    @Transactional
    public DesignationResponse update(Long id, DesignationRequest request) {
        Designation designation = findOrThrow(id);
        designation.setTitle(request.title());
        designation.setDescription(request.description());
        return toResponse(designationRepository.save(designation));
    }

    @Override
    @Transactional(readOnly = true)
    public DesignationResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignationResponse> getAll() {
        return designationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Designation designation = findOrThrow(id);
        designation.setActive(false);
        designationRepository.save(designation);
    }

    private Designation findOrThrow(Long id) {
        return designationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Designation", id));
    }

    private DesignationResponse toResponse(Designation d) {
        return DesignationResponse.builder()
                .id(d.getId()).title(d.getTitle()).description(d.getDescription()).active(d.isActive())
                .build();
    }
}
