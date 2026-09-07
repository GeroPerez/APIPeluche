package gordo.peluche.Entidades;

import jakarta.persistence.*;

@Entity
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private string contrasena;
    private String direccion;
    private int cuit;

    @OneToMany(mappedBy = "clientes", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Compra> compras;




}
