import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const FormFieldsManager = ({ 
  requiredFields, 
  onRequiredFieldsChange,
  customFields,
  onCustomFieldsChange
}) => {
  const handleRequiredFieldChange = (field) => (event) => {
    onRequiredFieldsChange({
      ...requiredFields,
      [field]: event.target.checked
    });
  };

  const handleAddCustomField = () => {
    onCustomFieldsChange([
      ...customFields,
      {
        name: `campo_${customFields.length + 1}`,
        label: '',
        type: 'text',
        required: false,
        options: []
      }
    ]);
  };

  const handleRemoveCustomField = (index) => {
    const newFields = customFields.filter((_, i) => i !== index);
    onCustomFieldsChange(newFields);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index] = {
      ...newFields[index],
      [field]: value,
      options: field === 'type' && value === 'select' ? [] : newFields[index].options || []
    };
    onCustomFieldsChange(newFields);
  };

  const handleAddOption = (fieldIndex) => {
    const newFields = [...customFields];
    if (!Array.isArray(newFields[fieldIndex].options)) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options.push({ 
      label: `Opção ${newFields[fieldIndex].options.length + 1}`, 
      value: `opcao_${newFields[fieldIndex].options.length + 1}` 
    });
    onCustomFieldsChange(newFields);
  };

  const handleRemoveOption = (fieldIndex, optionIndex) => {
    const newFields = [...customFields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    onCustomFieldsChange(newFields);
  };

  const handleOptionChange = (fieldIndex, optionIndex, field, value) => {
    const newFields = [...customFields];
    if (!Array.isArray(newFields[fieldIndex].options)) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options[optionIndex] = {
      ...newFields[fieldIndex].options[optionIndex],
      [field]: value,
      value: field === 'label' ? value.toLowerCase().replace(/\s+/g, '_') : value
    };
    onCustomFieldsChange(newFields);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Campos Obrigatórios
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Os campos Nome, E-mail e Telefone são sempre obrigatórios
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requiredFields.cpf}
                    onChange={handleRequiredFieldChange('cpf')}
                  />
                }
                label="CPF"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requiredFields.age}
                    onChange={handleRequiredFieldChange('age')}
                  />
                }
                label="Data de Nascimento"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requiredFields.gender}
                    onChange={handleRequiredFieldChange('gender')}
                  />
                }
                label="Gênero"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requiredFields.address}
                    onChange={handleRequiredFieldChange('address')}
                  />
                }
                label="Endereço Completo"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requiredFields.imageAuth}
                    onChange={handleRequiredFieldChange('imageAuth')}
                  />
                }
                label="Autorização de Uso de Imagem"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Campos Personalizados
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddCustomField}
              variant="contained"
              size="small"
            >
              Adicionar Campo
            </Button>
          </Box>

          {customFields.map((field, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Nome do Campo"
                    value={field.label}
                    onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={field.type}
                      onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                      label="Tipo"
                    >
                      <MenuItem value="text">Texto</MenuItem>
                      <MenuItem value="select">Seleção</MenuItem>
                      <MenuItem value="number">Número</MenuItem>
                      <MenuItem value="date">Data</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.required}
                        onChange={(e) => handleCustomFieldChange(index, 'required', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Obrigatório"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <IconButton
                    onClick={() => handleRemoveCustomField(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>

                {field.type === 'select' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Opções
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddOption(index)}
                        sx={{ mb: 1 }}
                      >
                        Adicionar Opção
                      </Button>
                      {field.options?.map((option, optionIndex) => (
                        <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            label="Rótulo"
                            value={option.label}
                            onChange={(e) => handleOptionChange(index, optionIndex, 'label', e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            label="Valor"
                            value={option.value}
                            onChange={(e) => handleOptionChange(index, optionIndex, 'value', e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveOption(index, optionIndex)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormFieldsManager; 