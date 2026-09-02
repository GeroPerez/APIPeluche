package gordo.peluche.Entidades;

import jakarta.persistence.*;

@Entity
public class Clientes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private string contraseña;
    private String direccion;
    private int cuit;






}
